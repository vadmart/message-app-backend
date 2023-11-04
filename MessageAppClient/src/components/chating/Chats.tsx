import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { View, StyleSheet, FlatList, Pressable, Text } from "react-native";
import {AppBaseURL} from "../../AppBaseURL";
import { storage } from "../Storage";
import { Auth } from "../../Auth";
import { NotificationWillDisplayEvent, OneSignal } from "react-native-onesignal";
import { ChatInterface, Message } from "./MessageType";


// function isMessageInfo(obj: any): obj is MessageInfo {
//     return "chat" in obj && "sender" in obj && "created_at" in obj && "edited_at" in obj
// }

function isAMessage(obj: any): obj is Message {
    return "chat" in obj && "sender" in obj && "created_at" in obj && "edited_at" in obj
}


function getNewChatsByChangingContent(event: NotificationWillDisplayEvent, chats: ChatInterface[]): ChatInterface[] {
    if (!isAMessage(event.notification.additionalData)) return
    const message = event.notification.additionalData;
    message.content = event.notification.body;
    for (let i = 0; i < chats.length; ++i) {
        if (chats[i].public_id == message.chat) {
            chats[i].last_message.content = message.content;
            chats[i].last_message.created_at = message.created_at;
            chats[i].last_message.edited_at = message.edited_at;
            break;
        }
    }
    console.log("Current chats: ");
    console.log(chats);
    return chats
}

function Chats({route, navigation}) {

    const [chats, setChats] = useState<ChatInterface[] | null>(null);
    const user = JSON.parse(storage.getString("auth") || "{}").user.username;
    console.log(user);

    useEffect(() => {
        const auth: Auth = JSON.parse(storage.getString("auth"));
        console.log(auth);
        axios.get(AppBaseURL + "chat/", {
            headers: {
                Authorization: `Bearer ${auth.access}`
            }
        })
        .then((response) => {
            setChats(response.data);
            console.log(response.data)
        })
        .catch((e) => console.log(e))
    }, [])

    function newChats(e: NotificationWillDisplayEvent) {
        e.preventDefault();
        if (!chats) return null;
        const newChats = getNewChatsByChangingContent(e, chats);
        setChats(() => [...newChats]);
    }

    OneSignal.Notifications.addEventListener("foregroundWillDisplay", newChats);
    

    return (
        <View style={styles.container}>
            <FlatList data={chats} 
                    renderItem={({item}) => {
                    return (
                        <Pressable style={styles.message} onPress={(e, data=item) => {
                            console.log(data);
                            navigation.navigate("Chat", {chatData: data});
                        }
                            }>
                            <View style={styles.senderTextBlock}>
                                <Text style={styles.messageSender}>{(item.first_user == user) ? item.second_user : item.first_user}</Text>
                                <Text style={styles.messageText}>{item.last_message.content}</Text>
                            </View>    
                            <View style={styles.dateBlock}>
                                <Text style={styles.messageDate}>{item.last_message.created_at}</Text>
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
        // alignItems: "center"
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
        fontSize: 20,
        fontWeight: "bold"
    },
    messageText: {
        fontSize: 20,
    },
    dateBlock: {
        flex: 0.2,
        justifyContent: "center",
    },
    messageDate: {},
    messageData: {
        display: "none"
    },
})
export default Chats;