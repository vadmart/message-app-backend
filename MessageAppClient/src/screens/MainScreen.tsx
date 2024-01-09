import React, {useEffect, useState, memo} from "react";
import ChatsScreen from "./ChatsScreen";
import MessagesScreen from "./MessagesScreen"
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {Chat_, isAChat} from "@app/types/ChatType";
import {ChatProvider} from "@app/context/ChatContext";
import {OneSignal, NotificationWillDisplayEvent} from "react-native-onesignal";
import {isAMessage, Message} from "@app/types/MessageType";
import {useAuth} from "@app/context/AuthContext";
import {sortChats} from "@app/components/helpers/sort";
import ScreenNames, {BaseWebsocketURL} from "@app/config";

const Stack = createNativeStackNavigator();

type WebSocketResponse = {
    chats?: Chat_[],
    chat: Chat_,
    chat_id?: string,
    message?: Message,
    action?: "create" | "update" | "delete"
}

const MainScreen = () => {
    console.log("Rendering MainScreen");
    const [chats, setChats] = useState<Chat_[]>([]);
    const chatsState = {chats, setChats};
    const {authState} = useAuth();
    useEffect(() => {
        const ws = new WebSocket(BaseWebsocketURL + `?token=${authState.access}`);
        ws.onmessage = (e => {
            console.log("OnMessage: ");
            const receivedData: WebSocketResponse = JSON.parse(e.data);
            console.log(receivedData);
            if (receivedData.chats) {
                setChats(receivedData.chats);
            }
            else if (receivedData.message) {
                let currChat: Chat_ = null;
                for (let i = 0; i < chats.length; ++i) {
                    console.log(`Current public_id: ${chats[i].public_id}, expected public_id: ${receivedData.message.chat}`)
                    if (chats[i].public_id === receivedData.message.chat) {
                        currChat = chats[i];
                        break;
                    }
                }
                if (currChat === null) {
                    console.log("OnMessage: Haven't found any suitable chat");
                    return
                }
                const currMessages = currChat.messages;
                switch (receivedData.action) {
                    case "create":
                        console.log("Start handling 'create' action")
                        currMessages.push(receivedData.message);
                        setChats([...chats.sort(sortChats)]);
                        break;
                    case "update":
                        for (let i = currMessages.length - 1; i >= 0; --i) {
                            if (currMessages[i].public_id == receivedData.message.public_id) {
                                currMessages[i] = receivedData.message;
                                setChats([...chats]);
                                return;
                            }
                        }
                }
            }
        })
        console.log("Chats: ");
        console.log(chats);
        return () => {
            ws.close();
        }
    }, [])

    return (
        <ChatProvider value={chatsState}>
            <Stack.Navigator initialRouteName={ScreenNames.CHATS_SCREEN}>
                <Stack.Screen name={ScreenNames.CHATS_SCREEN}
                              component={ChatsScreen}
                              options={{headerShown: false}}
                />
                <Stack.Screen name={ScreenNames.MESSAGES_SCREEN}
                              component={MessagesScreen}
                              />
            </Stack.Navigator>
        </ChatProvider>
    )
}

export default MainScreen;