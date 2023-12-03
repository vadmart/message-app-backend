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


const Stack = createNativeStackNavigator();

type State = {
    isLoading: boolean,
    isSignout: boolean,
    auth: Auth
}

type Action = {
    type: string
    auth?: Auth
}

const SplashScreen = () => {
    return (
        <View>
            <Text>Loading...</Text>
        </View>
    )
}

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
        <SafeAreaView style={styles.container}>
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
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#007767",
    }
});
export default App;