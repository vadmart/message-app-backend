import React, {useEffect, useRef, useState, memo} from "react"
import {FlatList, StyleSheet, View} from "react-native";
import {AppBaseURL} from "@app/config";
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

const markMessageAsRead = async (message_id: string) => {
    try {
        const response = await axios.post(AppBaseURL + `message/${message_id}/read/`);
        console.log(`Message ${message_id} was marked as read`);
        return response
    } catch (e) {
        console.error(`Message was not marked as read due to error: ${e}`);
    }
}

// @ts-ignore
const MessagesScreen = memo(({route, navigation}) => {
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


    const renderMessage = (props) => {
        // console.log(props);
        if (!payload.chatData.messages) return;
        return <MessageItem index={props.index} messages={payload.chatData.messages} item={props.item} />
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

    const createMessage = (text=null, singleFile=null) => {
        const arrLength = payload.chatData.messages.push({
            created_at: new Date().toString(),
            chat: payload.chatData.public_id,
            sender: authState.user,
            is_read: false,
            is_edited: false,
            content: text,
            public_id: Math.random().toString()
        });
        // changeChatInChats(payload.chatData);
        setChats([...chats.sort(sortChats)]);
        sendMessage(text, singleFile)
            .then((response) => {
                payload.chatData.messages[arrLength - 1] = response.data;
                setChats([...chats.sort(sortChats)])
            })
            .catch(() => {payload.chatData.messages[arrLength - 1].hasSendingError = true});
    }

    const sendMessage = async(text="", singleFile=null) => {
        const formData = new FormData();
        if (text) {
            formData.append("content", text);
        }
        if (singleFile) {
            // @ts-ignore
            formData.append("file", singleFile);
        }
        if (payload.chatData) {
            formData.append("chat", payload.chatData.public_id)
        } else {
            formData.append("second_user", payload.userData.public_id)
        }
        return axios.post(AppBaseURL + "message/", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
    }

    useEffect(() => {
        console.log("Start useEffect in MessagesScreen");
        // changing navigation header title to username
        navigation.setOptions({title: payload.title});

        // if we have only user data and no chat data, we won't receive messages, because they obviously don't exist
        if (!payload.chatData) return;
        if (!payload.chatData.areMessagesFetched) {
            getResponseMessagesData(AppBaseURL + `chat/${payload.chatData.public_id}/message/`)
            .then((results) => {
                payload.chatData.messages = results.sort(sortMessages);
                payload.chatData.areMessagesFetched = true;
                // changeChatInChats(payload.chatData);
                setChats([...chats.sort(sortChats)]);
            })
            .catch(e => console.log(e));
        }
        messageListRef.current?.scrollToEnd({animating: true});
        // for (let message of payload.chatData.messages) {
        //     // if it is a message from another user, and it's not read, we mark it as read
        //     if (authState.user.username != message.sender.username && !message.is_read) {
        //         payload.chatData.unread_count -= 1;
        //         changeChatInChats(payload.chatData);
        //         setChats([...chats]);
        //     }
        // }Кул
        console.log("End useEffect in MessagesScreen");
    }, [])


    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            console.log("InetState:");
            console.log(state);
            if (state.isConnected) {
                const messages = payload.chatData.messages;
                for (let i = messages.length - 1; i >= 0; --i) {
                    if (messages[i].hasSendingError == true) {
                        delete messages[i].hasSendingError;
                        sendMessage(messages[i].content, messages[i].file)
                            .then((response) => {
                                Object.keys(messages[i]).forEach(key => {
                                    messages[i][key] = response.data[key];
                                });
                                setChats([...chats.sort(sortChats)])
                            })
                            .catch((e) => {messages[i].hasSendingError = true});
                    } else break
                }
            }
        });
        return () => {
            unsubscribe();
        }
    }, [])

    return (
        <View style={styles.container}>
            <FlatList
                style={styles.messageList}
                data={payload.chatData.messages}
                ref={messageListRef}
                renderItem={renderMessage}
                keyExtractor={item => item.public_id}
                onRefresh={onFlatListRefresh}
                refreshing={isRefresh}
            />
            <View style={styles.footer}>
                <ChatKeyboard onCreateMessage={createMessage}/>
            </View>
        </View>
    )
})

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