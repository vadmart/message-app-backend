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

const Stack = createNativeStackNavigator();

const MainScreen = () => {
    console.log("Rendering MainScreen");
    const [chats, setChats] = useState<Chat_[]>([]);
    const chatsState = {chats, setChats};
    const {authState} = useAuth();
    console.log("MainScreen: ChatsScreen: ");
    console.log(chats);
    useEffect(() => {
        const notificationsListener = (e: NotificationWillDisplayEvent) => {
            console.log("Incoming notification...");
            if (!chats) return;
            const incomingObject= Object.assign(e.notification.additionalData, {content: e.notification.body});
            if (isAMessage(incomingObject)) {
                for (let i = chats.length - 1; i >= 0; --i) {
                    if (chats[i].public_id == incomingObject.chat) {
                        chats[i].messages.push(incomingObject);
                        if (authState.user.username != incomingObject.sender.username) {
                            chats[i].unread_count += 1;
                        }
                        break;
                    }
                }
                chats.sort(sortChats);
                setChats(() => [...chats]);
            } else if (isAChat(incomingObject)) {
                setChats(() => [...chats, incomingObject]);
            }
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
                              component={ChatsScreen}
                              options={{headerShown: false}}
                />
                <Stack.Screen name={"Messages"}
                              component={MessagesScreen}
                              />
            </Stack.Navigator>
        </ChatProvider>
    )
}

export default MainScreen;