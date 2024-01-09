import React, {useEffect, useRef, useState, memo} from "react"
import {FlatList, StyleSheet, View} from "react-native";
import {BaseHTTPURL} from "@app/config";
import axios from 'axios';
import {Message} from "@app/types/MessageType";
import ChatKeyboard from "@app/components/chating/ChatKeyboard";
import MessageItem from "../components/chating/MessageItem";
import {useAuth} from "@app/context/AuthContext";
import {useChat} from "@app/context/ChatContext";
import {sortChats, sortMessages} from "@app/components/helpers/sort";
import {Chat_} from "@app/types/ChatType";
import {User} from "@app/types/UserType";
import NetInfo from "@react-native-community/netinfo";
import {OneSignal} from "react-native-onesignal";

const markMessageAsRead = async (message_id: string) => {
    try {
        const response = await axios.post(BaseHTTPURL + `message/${message_id}/read/`);
        console.log(`Message ${message_id} was marked as read`);
        return response
    } catch (e) {
        console.error(`Message was not marked as read due to error: ${e}`);
    }
}

// @ts-ignore
const MessagesScreen = ({route, navigation}) => {
    console.log("Rendering MessagesScreen");
    const messageListRef = useRef(null);
    const {chats, setChats} = useChat();
    const {payload}: {payload: {title: string,
                                chatData?: Chat_,
                                userData?: User,
                                chatIndex?: number}} = route.params;
    const {authState} = useAuth();
    const [responseMessagesData, setResponseMessagesData] =
        useState<{
            count: number,
            next: string,
            previous: string,
            results: Message[]
        }>({count: null, next: null, previous: null, results: null});
    const messageForChangeState: {message: Message,
                                  setMessageForChange: React.Dispatch<React.SetStateAction<Message>>} = {message: null,
                                                                                             setMessageForChange: null};
    [messageForChangeState.message, messageForChangeState.setMessageForChange] = useState(null);

    const renderMessage = (props) => {
        // console.log(props);
        if (!payload.chatData.messages) return;
        return <MessageItem index={props.index}
                            messages={payload.chatData.messages}
                            item={props.item}
                            messageForChangeState={messageForChangeState}
                            />
    }

    const getResponseMessagesData = async (url: string) => {
        const response = await axios.get(url);
        ({
            results: responseMessagesData.results,
            previous: responseMessagesData.previous,
            next: responseMessagesData.next,
            count: responseMessagesData.count
        } = response.data);
        return responseMessagesData.results
    }

    const [isRefresh, setIsRefresh] = useState(false);
    const onFlatListRefresh = () => {
        // console.log(responseMessagesData.next);
        if (!responseMessagesData.next) return;
        setIsRefresh(true);
        getResponseMessagesData(responseMessagesData.next).then((results) => {
                payload.chatData.messages.unshift(...results.sort(sortMessages));
                setChats([...chats].sort(sortChats));
            }
        ).catch(e => console.log(e))
        setIsRefresh(false);
    }

    const sendMessage = async(method="POST", message: Message) => {
        const formData = new FormData();
        if (message.public_id) {
            formData.append("public_id", message.public_id);
        }
        if (message.content) {
            formData.append("content", message.content);
        }
        if (message.file) {
            formData.append("file", message.file);
        }
        if (message.chat) {
            formData.append("chat", message.chat)
        } else {
            formData.append("second_user", payload.userData.public_id)
        }
        const url = (method == "POST") ? BaseHTTPURL + "message/" : BaseHTTPURL + `message/${message.public_id}/`;
        return axios(url,
            {
                method: method,
                data: formData,
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })
    }

    const changeMessage = (message: Message, text=null, singleFile=null) => {
        message.content = text;
        message.file = singleFile;
        setChats([...chats]);
        sendMessage("PUT", message)
            .then((response) => {
                message = response.data;
                setChats([...chats]);
            })
            .catch(() => {message.hasSendingError = true})
    }

    const createMessage = (text=null, singleFile=null) => {
        const newMessage = {
            created_at: new Date().toString(),
            chat: payload.chatData?.public_id,
            sender: authState.user,
            is_read: false,
            is_edited: false,
            content: text,
            public_id: Math.random().toString(),
            file: singleFile,
            hasSendingError: null
        };
        // changeChatInChats(payload.chatData);
        sendMessage("POST", {...newMessage, public_id: null})
            .catch((e) => {
                console.warn(e.response.data);
                newMessage.hasSendingError = true;
                payload.chatData.messages.push(newMessage);
                setChats([...chats.sort(sortChats)]);
            });
    }

    useEffect(() => {
        console.log("Start useEffect in MessagesScreen");
        navigation.setOptions({title: payload.title});

        // if we have only user data and no chat data, we won't receive messages, because they obviously don't exist
        if (!payload.chatData) return;
        if (!payload.chatData.areMessagesFetched) {
            getResponseMessagesData(BaseHTTPURL + `chat/${payload.chatData.public_id}/message/`)
            .then((results) => {
                payload.chatData.messages = results.sort(sortMessages);
                payload.chatData.areMessagesFetched = true;
                // changeChatInChats(payload.chatData);
                setChats([...chats.sort(sortChats)]);
            })
            .catch(e => console.log(e));
        }
        messageListRef.current?.scrollToEnd({animating: true});
        console.log("End useEffect in MessagesScreen");
    }, [])

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            console.log("InetState:");
            console.log(state);
            if (!payload.chatData) return;
            if (state.isConnected) {
                const messages = payload.chatData.messages;
                for (let i = messages.length - 1; i >= 0; --i) {
                    if (messages[i].hasSendingError == true) {
                        delete messages[i].hasSendingError;
                        sendMessage("POST", messages[i])
                            .then((response) => {
                                Object.keys(messages[i]).forEach(key => {
                                    messages[i][key] = response.data[key];
                                });
                                setChats([...chats.sort(sortChats)])
                            })
                            .catch((e) => {messages[i].hasSendingError = true});
                    }
                }
            }
        });

        const foregroundNotificationListener = (e) => {
            if (!("chat_id" in e.notification.additionalData)) {
                console.log("Notification must include 'chat_id'");
                return
            }
            if (e.notification.additionalData.chat_id == payload.chatData.public_id) {
                e.preventDefault();
            }
        };
        OneSignal.Notifications.addEventListener("foregroundWillDisplay", foregroundNotificationListener);

        return () => {
            unsubscribe();
            OneSignal.Notifications.removeEventListener("foregroundWillDisplay", foregroundNotificationListener);
        }
    }, []);

    return (
        <View style={styles.container}>
            <FlatList
                style={styles.messageList}
                data={payload.chatData?.messages}
                ref={messageListRef}
                renderItem={renderMessage}
                keyExtractor={item => item.public_id}
                onRefresh={onFlatListRefresh}
                refreshing={isRefresh}
            />
            <View style={styles.footer}>
                <ChatKeyboard onCreateMessage={createMessage}
                              onChangeMessage={changeMessage}
                              messageForChangeState={messageForChangeState} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#007767"
    },
    messageList: {
        flex: 1,
        paddingTop: 10,
    },
    footer: {
        backgroundColor: "#FFFFFF",
    },
})
export default MessagesScreen;