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

const MainScreen = () => {
    console.log("Rendering MainScreen");
    const [chats, setChats] = useState<Chat_[]>([]);
    const chatsState = {chats, setChats};
    const {authState} = useAuth();
    useEffect(() => {
        const ws = new WebSocket(BaseWebsocketURL + `?token=${authState.access}`);
        ws.onmessage = (e => {
            // setChats(JSON.parse(e.data).chats);
            console.log("OnMessage: ");
            console.log(e.data);
            const content = JSON.parse(e.data);
            if (content.chats) {
                setChats(content.chats);
            } else if (content.message) {
                let currChat: Chat_ = null;
                for (let i = 0; i < chats.length; ++i) {
                    if (chats[i].public_id == content.chat.public_id) {
                        currChat = chats[i];
                        break;
                    }
                }
                if (currChat === null && content.action == "create") {
                    setChats([...chats, content.chat])
                    return
                }
                const currMessages = currChat.messages;
                switch (content.action) {
                    case "create":
                        for (let i = currMessages.length - 1; i >= 0; --i) {
                            if (currMessages[i].public_id == content.message.public_id) {
                                currMessages[i] = content.message;
                                setChats([...chats.sort(sortChats)]);
                                return
                            }
                        }
                        currChat.messages.push(content.message);
                        break;
                    case "update":
                        for (let i = currMessages.length - 1; i >= 0; --i) {
                            if (currMessages[i].public_id == content.message.public_id) {
                                currMessages[i] = content.message;
                                setChats([...chats]);
                                return;
                            }
                        }
                }
            }

        })
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