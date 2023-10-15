import { useEffect, useState, useContext, createContext } from 'react';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import { View, 
         Text, 
         SafeAreaView, 
         StyleSheet, 
         StatusBar } from "react-native";
import { storage } from './src/components/Storage';
import { NavigationContainer } from "@react-navigation/native"
import { useFonts } from 'expo-font';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginForm from "./src/screens/LoginForm";
import MainScreen from './src/screens/MainScreen';
import { AppBaseURL } from './src/AppBaseURL';
import axios from 'axios';
// import { Auth } from './src/Auth';

OneSignal.Debug.setLogLevel(LogLevel.Verbose); // for OneSignal Debugging
OneSignal.initialize("ONESIGNAL_APP_ID");

OneSignal.Notifications.requestPermission(true);

// Method for listening for notification clicks
OneSignal.Notifications.addEventListener("click", (event) => {
    console.log("OneSignal: notification clicked: ");  
    console.log(event);
})


const Stack = createNativeStackNavigator();


const ScreenNames = {
    REGISTRATION: "Registration",
    LOGIN: "Login",
    MAIN_SCREEN: "MainScreen"
}


function App() {
    const fontsLoaded = useFonts({
        Poppins: require("./assets/fonts/Poppins-Regular.ttf")
    });

    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState("");
    const [refreshed, setRefreshed] = useState(false);
    const [initScreenName, setInitScreenName] = useState("");


    useEffect(() => {
        const authDataString = storage.getString("auth");
        if (!authDataString) return;
        const authData = JSON.parse(authDataString);
        axios.post(AppBaseURL + "auth/token/verify/", {
            "token": authData.access
        })
        .then(() => {
            setInitScreenName(ScreenNames.MAIN_SCREEN);
            setLoaded(true);
        })
        .catch((e) => {
            // if status is 401, it means our access token is expired. Trying to get another one.
            if (e.response.status == 401 && e.response.data["code"] == "token_not_valid") {
                axios.post(AppBaseURL + "auth/token/refresh/", {
                    "refresh": authData.refresh
                })
                .then((response) => {
                    authData.access = response.data.access;
                    storage.set("auth", JSON.stringify(authData));
                    setRefreshed(true);
                })
                .catch((e) => {
                    setError(e);
                    setInitScreenName(ScreenNames.LOGIN);
                    setLoaded(true);
                })
            } else {
                setError(e);
                setInitScreenName(ScreenNames.REGISTRATION);
                setLoaded(true);
                console.error("Something's wrong. Error: " + e);
            }
        })
    }, [refreshed])
    
    if (!fontsLoaded || !loaded) return null;
    // if (!loaded) return null;
    console.log(`Current screen is: ${initScreenName}`)

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={'#001100'} />
            <NavigationContainer>
                    <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName={initScreenName}>
                        <Stack.Screen component={LoginForm} name={ScreenNames.LOGIN} />
                        <Stack.Screen component={MainScreen} name={ScreenNames.MAIN_SCREEN}/>
                    </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#007767",
        paddingTop: 10,
    }
});
export default App;