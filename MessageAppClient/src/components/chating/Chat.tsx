import React, {useEffect, useState, useRef, useReducer} from "react"
import { OneSignal } from "react-native-onesignal";
import { View, StyleSheet, FlatList } from "react-native";
import { AppBaseURL } from "@app/config";
import axios from 'axios';
import {Message, Chat_, isAMessage, isAMessageArray} from "@app/components/chating/MessageType";
import { User } from "@app/components/chating/UserType";
import { ChatKeyboard } from "@app/components/chating/elements/ChatKeyboard";
import MessageItem from "./elements/MessageItem";
import {useAuth} from "@app/context/AuthContext";
import {useChat} from "@app/context/ChatContext";


const Chat = ({route, navigation}) => {
    console.log("rendering Chat");
    const messageListElem = useRef(null);
    const {chats, setChats} = useChat();
    const [messages, setMessages] = useState<Message[]>(null);
    const {authState} = useAuth();
    const {userData,
        chatData,
        title}: {userData: User, chatData: Chat_, title: string} = route.params;

    useEffect(() => {
        // changing navigation header title to username
        navigation.setOptions({
            title
        })
        // if we have only user data and no chat data, we won't receive messages, because they obviously don't exist
        if (!chatData) return;
        axios.get(AppBaseURL + `message/?chat_id=${chatData.public_id}`)
        .then((response) => {
            if (!isAMessageArray(response.data)) return
            for (let message of response.data) {
                // if it is a message from another user, and it's not read, we mark it as read
                if (authState.user.username != message.sender && !message.is_read) {
                    for (let chat of chats) {
                        if (chat.public_id == message.chat) {
                            chat.unread_messages_count -= 1
                            setChats(() => [...chats, chat])
                        }
                    }
                    axios.post(AppBaseURL + `message/${message.public_id}/read/`)
                        .then((resp) => console.log(resp.data))
                        .catch((err) => console.warn(err))
                }
            }
            setMessages(response.data);
            messageListElem.current?.scrollToEnd();
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
            initialNumToRender={7}
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