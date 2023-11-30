import React, {useState} from "react";
import Chats from "../components/chating/Chats";
import Chat from "../components/chating/Chat"
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {Chat_, Message} from "@app/components/chating/MessageType";
import {ChatProvider} from "@app/context/ChatContext";

const Stack = createNativeStackNavigator();

const MainScreen = () => {
    console.log("Rendering MainScreen");
    const [chats, setChats] = useState<Chat_[]>([]);
    const chatsState = {chats, setChats};
    console.log("MainScreen: Chats: ");
    console.log(chats);
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