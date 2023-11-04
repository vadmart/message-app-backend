import React, { useEffect, useState } from "react"
import { NotificationWillDisplayEvent, OneSignal } from "react-native-onesignal";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { AppBaseURL } from "../../AppBaseURL";
import { storage } from "../Storage";
import axios from 'axios';
import { Message, ChatInterface, isAMessage } from "./MessageType";
import { ChatKeyboard } from "./ChatKeyboard";

function MessageItem ({item, index, messages}: {item: Message, index: number, messages: readonly Message[]}) {
    console.log("rendering MessageItem");
    const [currentDate, currentTime] = item.created_at.split(" ");
    const previousDate = (index !== 0) && messages[index - 1].created_at.split(" ")[0]; 
    const nextDate = (index < messages.length - 1) && messages[index + 1].created_at.split(" ")[0];
    const nextSender = (index < messages.length - 1) && messages[index + 1].sender;
    console.log(currentDate);
    return (<View>
            {(currentDate !== previousDate) && <View style={styles.dateBlock}>
                                            <View style={styles.date}>
                                                <Text style={styles.dateText}>{currentDate}</Text>
                                            </View>
                                        </View>}
            <View style={styles.messageBlock}>
                <View style={styles.avatarBlock}>
                {(currentDate !== nextDate || item.sender !== nextSender) && <View style={styles.avatar}>
                                                                        <Text style={styles.avatarText}>{item.sender[0]}</Text>
                                                                      </View>}
                    
                </View>
                <View style={styles.rightBlock}>
                    <View style={styles.contentTimeBlock}>
                        <View style={styles.contentBlock}>
                            <Text style={styles.content}>{item.content}</Text>
                        </View>
                        <View style={styles.timeBlock}>
                            <Text style={styles.time}>{currentTime}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}


function showMessage(event: NotificationWillDisplayEvent, messages: Message[], setMessages) {
    if (!isAMessage(event.notification.additionalData)) return
    const newMessage = event.notification.additionalData;
    newMessage.content = event.notification.body;

}

function Chat({route}) {
    console.log("rendering Chat");
    const authData = JSON.parse(storage.getString("auth") || "{}");
    if (authData.length == 0) return;
    const [messages, setMessages] = useState<Message[]>(null);
    const chatData: ChatInterface = route.params["chatData"];

    useEffect(() => {
        axios.get(AppBaseURL + `message/?chat_id=${chatData.public_id}`, {
            headers: {
                Authorization: `Bearer ${authData.access}`
            }
        })
        .then((response) => {
            setMessages(response.data);
        })
        .catch((e) => {
            console.log(e);
        })
    }, [])

    const showMessage = (e: NotificationWillDisplayEvent) => {
        if (!isAMessage(e.notification.additionalData)) return
        console.log(e);
    }
    
    OneSignal.Notifications.addEventListener("foregroundWillDisplay", showMessage);

    return (
        <View style={styles.container}>
            <FlatList
            style={{paddingTop: 10}} 
            data={messages}
            renderItem={(props) => {
                return <MessageItem item={props.item} index={props.index} messages={messages}/>
            }}
            />
            <View style={styles.footer}>
                <ChatKeyboard chatData={chatData} authData={authData} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#007767"
    },
    messageBlock: {
        marginBottom: 20,
        flexDirection: "row"
    },
    avatarBlock: {
        flex: 0.15,
        justifyContent: "flex-end",
        alignItems: "center"
    },
    avatar: {
        backgroundColor: "#D9D9D9",
        height: 35,
        borderRadius: 50,
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    avatarText: {
        fontSize: 20
    },
    rightBlock: {
        flex: 0.8,
        alignItems: "flex-start"
    },
    contentTimeBlock: {
        borderRadius: 10,
        backgroundColor: "#D9D9D9",
        padding: 10,
    },
    contentBlock: {
        marginRight: 15
    },
    content: {
        fontSize: 16
    },
    timeBlock: {
        alignSelf: "flex-end"
    },
    time: {
        color: "#777777"
    },
    dateBlock: {
        alignItems: "center"
    },
    date: {
        marginBottom: 10
    },
    dateText: {
        color: "#FFFFFF",
        fontSize: 18
    },
    footer: {
        backgroundColor: "#FFFFFF",
        height: 45,
        flexDirection: "row"
    },
})
export default Chat;