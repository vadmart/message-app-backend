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
import ContactSearcher from "@app/components/chating/elements/ContactSearcher";

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
            <ContactSearcher navigation={navigation}/>
            <FlatList data={chats} 
                    renderItem={({item}) => {
                    return (
                        <Pressable style={styles.message} onPress={(e, data=item) => {
                            navigation.navigate("Chat", {chatData: data});
                        }
                            }>
                            <View style={styles.senderTextBlock}>
                                {/* @ts-ignore */}
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