// import React from "react";
import {
    SafeAreaView,
    StyleSheet,
    StatusBar, View,
    Text
} from "react-native";
import { NavigationContainer } from "@react-navigation/native"
// @ts-ignore
import {Auth} from "@app/Auth";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// @ts-ignore
import LoginForm from "@app/screens/LoginForm";
// @ts-ignore
import MainScreen from '@app/screens/MainScreen';
// @ts-ignore
import ScreenNames from '@app/config';
// @ts-ignore
import {AuthProvider, useAuth} from "@app/context/AuthContext";
// # TODO: fix ts-ignore
import {GestureHandlerRootView} from "react-native-gesture-handler";


const Stack = createNativeStackNavigator();

function App() {

    return (
            <AuthProvider>
                <Layout />
            </AuthProvider>
    )
}

export const Layout = () => {
    const {authState} = useAuth();
    return (
        <GestureHandlerRootView style={styles.container}>
            <StatusBar backgroundColor={'#001100'} />
            <NavigationContainer>
                <Stack.Navigator screenOptions={{headerShown: false}}>
                    {authState?.authenticated ? (
                        <Stack.Screen component={MainScreen} name={ScreenNames.MAIN_SCREEN}  />
                    )
                    : (
                        <Stack.Screen component={LoginForm} name={ScreenNames.LOGIN} />
                    )
                }
                </Stack.Navigator>
            </NavigationContainer>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#007767",
    }
});
export default App;