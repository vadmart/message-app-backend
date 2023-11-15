import React, { useEffect, useState } from "react";
import axios from "axios";
import { View, StyleSheet, FlatList, Pressable, Text, TextInput, Image } from "react-native";
import {AppBaseURL} from "@app/config";
import { storage } from "@app/components/Storage";
import { Auth } from "@app/Auth";
import { NotificationWillDisplayEvent, OneSignal } from "react-native-onesignal";
import { ChatInterface, isAMessage, isAChatArray } from "@app/components/chating/MessageType";
import { sortChats, toReadableDateTime } from "@app/components/chating/helpers/chatDatetime";
import {useAuth} from "@app/AuthContext";

const MAIN_FONT_SIZE = 20


const setNewChatMessages = (event: NotificationWillDisplayEvent, chats: ChatInterface[]) => {
    if (!isAMessage(event.notification.additionalData)) return
    const message = event.notification.additionalData;
    message.content = event.notification.body;
    for (let i = 0; i < chats.length; ++i) {
        if (chats[i].public_id == message.chat) {
            chats[i].last_message.content = message.content;
            chats[i].last_message.created_at = message.created_at;
            chats[i].last_message.edited_at = message.edited_at;
            const buf = chats[i];
            console.log(buf)
            break;
        }
    }
    console.log("Current chats: ");
    console.log(chats);
}

const Chats = ({route, navigation}) => {

    const [chats, setChats] = useState<ChatInterface[] | null>(null);
    const {authState} = useAuth();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState("");
    const auth: Auth = JSON.parse(storage.getString("auth") || "{}");

    useEffect(() => {
        console.log(auth);
        axios.get(AppBaseURL + "chat/")
        .then((response) => {
            if (!isAChatArray(response.data)) return
            const sortedChats = response.data.sort(sortChats);
            setChats(sortedChats);
        })
        .catch((e) => console.log(e))
    }, [])

    const updateChats = (e: NotificationWillDisplayEvent) => {
        e.preventDefault();
        if (!chats) return null;
        setNewChatMessages(e, chats);
        chats.sort(sortChats);
        setChats(() => [...chats]);
    }

    OneSignal.Notifications.addEventListener("foregroundWillDisplay", updateChats);
    

    return (
        <View style={styles.container}>
            <View style={styles.phoneNumberBlock}>
                <View style={styles.phoneNumberInputBlock}>
                    <TextInput style={styles.phoneNumberInput} keyboardType={"phone-pad"} onChangeText={(text) => {
                        setPhoneNumber(text);
                        if (error) setError("")}} />
                    <Pressable style={styles.phoneNumberButton} onPress={() => {
                        axios.get(AppBaseURL + `user/${encodeURIComponent(phoneNumber)}`)
                        .then((response) => {
                            const userData = response.data
                            axios.get(AppBaseURL + `chat/get_chat_by_user/?phone_number=${encodeURIComponent(phoneNumber)}`, {
                                headers: {
                                    Authorization: `Bearer ${auth.access}`
                                }
                            })
                                .then((resp) => {
                                    navigation.navigate("Chat", {chatData: resp.data})
                                })
                                .catch((e) => {
                                    navigation.navigate("Chat", {userData: userData})
                                })
                        })
                        .catch((err) => setError(err.response.data["detail"]))
                    }}>
                        <Image source={require("../../../assets/chat-icons/submit.png")} style={styles.phoneNumberButtonImage}/>
                    </Pressable>
                </View>
                <Text style={styles.phoneNumberError}>{error}</Text>
            </View>
            <FlatList data={chats} 
                    renderItem={({item}) => {
                    return (
                        <Pressable style={styles.message} onPress={(e, data=item) => {
                            console.log(data);
                            navigation.navigate("Chat", {chatData: data});
                        }
                            }>
                            <View style={styles.senderTextBlock}>
                                <Text style={styles.messageSender}>{(item.first_user == authState.user?.username) ? item.second_user : item.first_user}</Text>
                                <Text style={styles.messageText}>{item.last_message.content}</Text>
                            </View>    
                            <View style={styles.dateTimeBlock}>
                                <Text style={styles.messageDateTime}>{toReadableDateTime(new Date(item.last_message.created_at))}</Text>
                            </View>
                        </Pressable>
                    )
                    }}
                    extraData={chats}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#007767",
        paddingTop: 10,
        rowGap: 10
    },
    phoneNumberBlock: {
        alignSelf: "center",
        width: "70%"
    },
    phoneNumberInputBlock: {
        backgroundColor: "white",
        borderColor: "black",
        flexDirection: "row",
        height: 50,
        borderWidth: 3,
        borderRadius: 10,
        paddingLeft: 10,
    },
    phoneNumberInput: {
        fontSize: MAIN_FONT_SIZE,
        flex: 0.8
    },
    phoneNumberButton: {
        flex: 0.2,
        alignItems: "center"
    },
    phoneNumberButtonImage: {
        height: "100%", 
        aspectRatio: 1
    },
    phoneNumberError: {
        color: "#FF0000",
        paddingLeft: 5
    },
    message: {
        backgroundColor: "white",
        borderColor: "black",
        borderBottomWidth: 1,
        flexDirection: "row",
        paddingLeft: 5,
        paddingVertical: 10
    },
    senderTextBlock: {
        flex: 0.8
    },
    messageSender: {
        fontSize: MAIN_FONT_SIZE,
        fontWeight: "bold"
    },
    messageText: {
        fontSize: MAIN_FONT_SIZE,
    },
    dateTimeBlock: {
        flex: 0.2,
        justifyContent: "center",
        alignItems: "center"
    },
    messageDateTime: {
        textAlign: "center"
    },
    messageData: {
        display: "none"
    },
})
export default Chats;