import React, { useEffect, useState, } from "react"
import { NotificationWillDisplayEvent, OneSignal } from "react-native-onesignal";
import { View, StyleSheet, FlatList } from "react-native";
import { AppBaseURL } from "../../config";
import { storage } from "../Storage";
import axios from 'axios';
import { Message, ChatInterface, isAMessage } from "./MessageType";
import { User } from "./UserType";
import { ChatKeyboard } from "./ChatKeyboard";
import MessageItem from "./MessageItem";


const Chat = ({route}) => {
    console.log("rendering Chat");
    const authData = JSON.parse(storage.getString("auth") || "{}");
    if (authData.length == 0) return;
    const [messages, setMessages] = useState<Message[]>(null);
    let {userData, chatData}: {userData: User, chatData: ChatInterface} = route.params;

    useEffect(() => {
        // if we have only user data and no chat data, we won't receive messages, because they obviously don't exist
        if (!chatData) return;
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

    const updateMessage = (e: NotificationWillDisplayEvent) => {
        e.preventDefault();
        if (!messages || !isAMessage(e.notification.additionalData)) return
        console.log("Received message notification...")
        const message = e.notification.additionalData;
        message.content = e.notification.body;
        setMessages(() => [...messages, message]);
        console.log(messages);
    }
    
    OneSignal.Notifications.addEventListener("foregroundWillDisplay", updateMessage);

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
                <ChatKeyboard authData={authData} userData={userData} chatData={chatData}/>
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
    keyboardBlock: {
        flex: 0.9,
        justifyContent: "center",
        paddingLeft: 15
    },
    keyboard: {
        fontSize: 18
    },
    optionsBlock: {
        flex: 0.1,
        justifyContent: "center",
        alignItems: "center",
        paddingRight: 5
    },
    sendButtonIcon: {
        height: "85%",
        aspectRatio: 1
    }
})
export default Chat;