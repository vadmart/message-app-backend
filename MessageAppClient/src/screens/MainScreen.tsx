import React, {useEffect, useState} from "react";
import Chats from "../components/chating/Chats";
import Chat from "../components/chating/Chat"
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {Chat_} from "@app/types/ChatType";
import {ChatProvider} from "@app/context/ChatContext";
import {OneSignal, NotificationWillDisplayEvent} from "react-native-onesignal";
import {isAMessage, Message} from "@app/types/MessageType";
import {useAuth} from "@app/context/AuthContext";

const Stack = createNativeStackNavigator();

const MainScreen = () => {
    console.log("Rendering MainScreen");
    const [chats, setChats] = useState<Chat_[]>([]);
    const chatsState = {chats, setChats};
    const {authState} = useAuth();
    console.log("MainScreen: Chats: ");
    console.log(chats);
    useEffect(() => {
        if (!chats) return;
        const notificationsListener = (e: NotificationWillDisplayEvent) => {
            console.log("Incoming notification...");
            const message= Object.assign(e.notification.additionalData, {content: e.notification.body});
            if (!isAMessage(message)) return;
            console.log("Incoming message: ");
            console.log(message)
            for (let i = chats.length - 1; i >= 0; --i) {
                if (chats[i].public_id == message.chat) {
                    for (let param in message) {
                        chats[i].last_message[param] = message[param]
                    }
                    if (authState.user.username != message.sender.username) {
                        chats[i].unread_messages_count += 1;
                    }
                    break;
                }
            }
            setChats(() => [...chats])
        }

        OneSignal.Notifications.addEventListener("foregroundWillDisplay", notificationsListener);
        return () => {
            OneSignal.Notifications.removeEventListener("foregroundWillDisplay", notificationsListener)
        }
    }, [chats]);

    return (
        <ChatProvider value={chatsState}>
            <Stack.Navigator initialRouteName={"Chats"}>
                <Stack.Screen name={"Chats"}
                              component={Chats}
                              options={{headerShown: false}}
                />
                <Stack.Screen name={"Chat"}
                              component={Chat}
                              />
            </Stack.Navigator>
        </ChatProvider>
    )
}

export default MainScreen;