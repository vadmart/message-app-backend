import React from "react";
import Chats from "../components/chating/Chats";
import Chat from "../components/chating/Chat"
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

function MainScreen() {
    return (
    <Stack.Navigator initialRouteName={"Chats"}>
        <Stack.Screen component={Chats} name={"Spilka"} options={{headerShown: false}}/>
        <Stack.Screen component={Chat} name={"Chat"} />
    </Stack.Navigator>
    )
}

export default MainScreen;