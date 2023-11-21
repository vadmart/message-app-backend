import React, { useEffect, useState, useRef } from "react"
import { OneSignal } from "react-native-onesignal";
import { View, StyleSheet, FlatList } from "react-native";
import { AppBaseURL } from "@app/config";
import axios from 'axios';
import { Message, Chat_, isAMessage } from "@app/components/chating/MessageType";
import { User } from "@app/components/chating/UserType";
import { ChatKeyboard } from "@app/components/chating/elements/ChatKeyboard";
import MessageItem from "./elements/MessageItem";


const Chat = ({route, navigation}) => {
    console.log("rendering Chat");
    const [messages, setMessages] = useState<Message[]>(null);
    const messageListElem = useRef(null);
    let {userData, chatData}: {userData: User, chatData: Chat_} = route.params;

    // changing navigation header title to username
    useEffect(() => {
        navigation.setOptions({
        title: route.params.title
      })
    }, [navigation]);

    useEffect(() => {
        // if we have only user data and no chat data, we won't receive messages, because they obviously don't exist
        if (!chatData) return;
        axios.get(AppBaseURL + `message/?chat_id=${chatData.public_id}`)
        .then((response) => {
            setMessages(response.data);
        })
        .catch((e) => {
            console.log(e);
        })
    }, [])

    OneSignal.Notifications.addEventListener("foregroundWillDisplay", (e) => {
        e.preventDefault();
        if (!messages || !isAMessage(e.notification.additionalData)) return
        const message = e.notification.additionalData;
        message.content = e.notification.body;
        setMessages(() => [...messages, message]);
        messageListElem.current?.scrollToEnd();
    });

    return (
        <View style={styles.container}>
            <FlatList
            style={{paddingTop: 10}}
            data={messages}
            ref={messageListElem}
            renderItem={(props) => {
                return <MessageItem index={props.index} messages={messages}/>
            }}
            />
            <View style={styles.footer}>
                <ChatKeyboard userData={userData} chatData={chatData}/>
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