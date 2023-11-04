import React, { useEffect, useState } from "react"
import { NotificationWillDisplayEvent, OneSignal } from "react-native-onesignal";
import { View, StyleSheet, FlatList } from "react-native";
import { AppBaseURL } from "../../AppBaseURL";
import { storage } from "../Storage";
import axios from 'axios';
import { Message, ChatInterface, isAMessage } from "./MessageType";
import { ChatKeyboard } from "./ChatKeyboard";
import MessageItem from "./MessageItem";


const Chat = ({route}) => {
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

    if (!messages) return

    const showMessage = (e: NotificationWillDisplayEvent) => {
        e.preventDefault();
        if (!messages || !isAMessage(e.notification.additionalData)) return
        console.log("Received message notification...")
        const message = e.notification.additionalData;
        message.content = e.notification.body;
        setMessages(() => [...messages, message]);
        console.log(messages);
    }
    
    OneSignal.Notifications.addEventListener("foregroundWillDisplay", showMessage);
    console.log(messages)

    return (
        <View style={styles.container}>
            <FlatList
            style={{paddingTop: 10}} 
            data={messages}
            renderItem={(props) => {
                return <MessageItem index={props.index} messages={messages}/>
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
    
    
    footer: {
        backgroundColor: "#FFFFFF",
        height: 45,
        flexDirection: "row"
    },
})
export default Chat;