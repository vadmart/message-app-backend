import React, {useEffect, useRef, useState} from "react"
import {FlatList, StyleSheet, View} from "react-native";
import {AppBaseURL} from "@app/config";
import axios from 'axios';
import {Message} from "@app/types/MessageType";
import ChatKeyboard from "@app/components/chating/elements/ChatKeyboard";
import MessageItem from "./elements/MessageItem";
import {useAuth} from "@app/context/AuthContext";
import {useChat} from "@app/context/ChatContext";
import {sortChats} from "@app/components/helpers/sort";
import {Chat_} from "@app/types/ChatType";
import {User} from "@app/types/UserType";

const markMessageAsRead = async (message_id: string) => {
    try {
        const response = await axios.post(AppBaseURL + `message/${message_id}/read/`);
        console.log(`Message ${message_id} was marked as read`);
        return response
    } catch (e) {
        console.error(`Message was not marked as read due to error: ${e}`);
    }
}

const Messages = ({route, navigation}) => {
    console.log("Rendering Messages");
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
    const keyExtractor = item => item.public_id;
    const [isRefresh, setIsRefresh] = useState(false);

    const sortMessages = (firstMessage: Message, secondMessage: Message) => {
        return new Date(firstMessage.created_at).getTime() - new Date(secondMessage.created_at).getTime();
    }

    const renderMessage = (props) => {
        // console.log(props);
        return <MessageItem index={props.index} messages={payload.chatData.messages} item={props.item}/>
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

    const changeChatInChats = (currentChat: Chat_): void => {
        for (let i = 0; i < chats.length; ++i) {
            if (chats[i].public_id == currentChat.public_id) {
                chats[i] = currentChat;
                break
            }
        }
    }

    const markMessageAsRead = () => {
    }

    const onRefresh = () => {
        // console.log(responseMessagesData.next);
        if (!responseMessagesData.next) return;
        setIsRefresh(true);
        getResponseMessagesData(responseMessagesData.next).then((results) => {
                payload.chatData.messages.unshift(...results.sort(sortMessages));
                changeChatInChats(payload.chatData)
                setChats([...chats].sort(sortChats));
            }
        ).catch(e => console.log(e))
        setIsRefresh(false);
    }

    const createMessage = (text=null, singleFile=null) => {
        payload.chatData.messages.push({
            created_at: new Date().toString(),
            chat: payload.chatData.public_id,
            sender: authState.user,
            is_read: false,
            is_edited: false,
            content: text,
            public_id: Math.random().toString()
        });
        console.log("Pushed message: ");
        console.log(payload.chatData.messages.slice(-1))
        changeChatInChats(payload.chatData);
        setChats(chats.sort(sortChats));
        console.log(payload.chatData.messages);
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
        axios.post(AppBaseURL + "message/", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }).then((response) => {
            console.log(response.data);
        })
        .catch((err) => {
            console.error(err);
        })
    }

    useEffect(() => {
        console.log("Start useEffect in Messages");
        // changing navigation header title to username
        navigation.setOptions({title: payload.title});

        // if we have only user data and no chat data, we won't receive messages, because they obviously don't exist
        if (!payload.chatData) return;
        if (!payload.chatData.areMessagesFetched) {
            getResponseMessagesData(AppBaseURL + `chat/${payload.chatData.public_id}/message/`)
            .then((results) => {
                payload.chatData.messages = results.sort(sortMessages);
                payload.chatData.areMessagesFetched = true;
                changeChatInChats(payload.chatData);
                setChats([...chats]);
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
        console.log("End useEffect in Messages");
    }, [])


    return (
        <View style={styles.container}>
            <FlatList
                style={styles.messageList}
                data={payload.chatData.messages}
                ref={messageListRef}
                renderItem={renderMessage}
                keyExtractor={keyExtractor}
                onRefresh={onRefresh}
                refreshing={isRefresh}
            />
            <View style={styles.footer}>
                <ChatKeyboard onCreateMessage={createMessage}/>
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
export default Messages