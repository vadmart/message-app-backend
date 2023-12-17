import React, {useEffect, useState, useRef} from "react"
import {OneSignal} from "react-native-onesignal";
import {View, StyleSheet, FlatList, ListRenderItem} from "react-native";
import {AppBaseURL} from "@app/config";
import axios from 'axios';
import {Message, isAMessage} from "@app/types/MessageType";
import {Chat_} from "@app/types/ChatType";
import {User} from "@app/types/UserType";
import {ChatKeyboard} from "@app/components/chating/elements/ChatKeyboard";
import MessageItem from "./elements/MessageItem";
import {useAuth} from "@app/context/AuthContext";
import {useChat} from "@app/context/ChatContext";

const markMessageAsRead = async (message_id: string) => {
    try {
        const response = await axios.post(AppBaseURL + `message/${message_id}/read/`);
        console.log(`Message ${message_id} was marked as read`);
        return response
    } catch (e) {
        console.error(`Message was not marked as read due to error: ${e}`);
    }
}

const Chat = ({route, navigation}) => {
    console.log("Rendering Chat");
    const messageListRef = useRef(null);
    const {
        chats,
        setChats,
        messages,
        setMessages
    } = useChat();
    const {authState} = useAuth();
    const {
        userData,
        chatData,
        title
    }: { userData: User | null, chatData: Chat_ | null, title: string } = route.params;
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
        return <MessageItem index={props.index} messages={messages} item={props.item}/>
    }

    const getResponseMessagesData = async (url: string) => {
        try {
            const response = await axios.get(url);
            ({
                results: responseMessagesData.results,
                previous: responseMessagesData.previous,
                next: responseMessagesData.next,
                count: responseMessagesData.count
            } = response.data);
            console.log(response);
            return responseMessagesData.results
        } catch (e) {
            console.error(e);
        }
    }

    const markMessageAsRead = () => {}

    const onRefresh = () => {
        // console.log(responseMessagesData.next);
        if (!responseMessagesData.next) return;
        setIsRefresh(true);
        getResponseMessagesData(responseMessagesData.next).then((results) => {
                setMessages([...results.sort(), ...messages]);
            }
        )
        setIsRefresh(false);
    }

    useEffect(() => {
        console.log("Start useEffect in Chat");
        // changing navigation header title to username
        navigation.setOptions({title});

        // if we have only user data and no chat data, we won't receive messages, because they obviously don't exist
        if (!chatData) return;
        getResponseMessagesData(AppBaseURL + `message/?chat_id=${chatData.public_id}&limit=20`)
            .then((results) => {
                setMessages(results.sort(sortMessages));
            });
        messageListRef.current?.scrollToEnd({animating: true});
        // for (let message of results) {
        //     // if it is a message from another user, and it's not read, we mark it as read
        //     if (authState.user.username != message.sender.username && !message.is_read) {
        //         for (let chat of chats) {
        //             if (chat.public_id == message.chat && chat.unread_messages_count > 0) {
        //                 chat.unread_messages_count -= 1;
        //                 setChats(() => [...chats]);
        //                 markMessageAsRead(message.public_id);
        //                 break;
        //             }
        //         }
        //     }
        // }
        console.log("End useEffect in Chat");
        return () => {
            setMessages([]);
        }
    }, [])


    return (
        <View style={styles.container}>
            <FlatList
                style={styles.messageList}
                data={messages}
                ref={messageListRef}
                renderItem={renderMessage}
                keyExtractor={keyExtractor}
                onRefresh={onRefresh}
                onEndReached={() => console.log("Message is read")}
                refreshing={isRefresh}
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
    messageList: {
        flex: 1,
        paddingTop: 10,
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
export default Chat