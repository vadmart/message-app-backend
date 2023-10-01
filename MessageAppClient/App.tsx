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


const Stack = createNativeStackNavigator();

OneSignal.Debug.setLogLevel(LogLevel.Verbose); // for OneSignal Debugging
OneSignal.initialize("ONESIGNAL_APP_ID");

// Method for listening for notification clicks
OneSignal.Notifications.addEventListener("click", (event) => {
    console.log(`OneSignal: notification clicked: ${event}`);
})

type Auth = {
    access: string
    refresh: string
    user: object
}


function App() {
    const fontsLoaded = useFonts({
        Poppins: require("./assets/fonts/Poppins-Regular.ttf")
    });

    if (!fontsLoaded) return null;

    const [loaded, setLoaded] = useState(false);
    const [replicas, setReplicas] = useState([]);
    const [error, setError] = useState(null);
    const [refreshed, setRefreshed] = useState(false);

    useEffect(() => {
        const authDataString = storage.getString("auth");
        if (!authDataString) return;
        const authData: Auth = JSON.parse(authDataString);
        axios.get(AppBaseURL + "get-replicas/", {
            headers: {
                Authorization: `Bearer ${authData.access}`
            }
        })
        .then((response) => {
            // console.log(response.data);
            setReplicas(response.data);
            setLoaded(true);
        })
        .catch((e) => {
            // if status is 401, it means our access token is expired. Trying to get another one.
            if (e.response.status == 401) {
                axios.post(AppBaseURL + "auth/refresh/", {
                    "refresh": authData.refresh
                })
                .then((response) => {
                    authData.access = response.data.access;
                    storage.set("auth", JSON.stringify(authData));
                    setRefreshed(true);
                })
                .catch((e) => {
                    setError(e);
                    setLoaded(true);
                })
            } else {
                setError(e);
            }
        })
    }, [refreshed])
    
    // if (!loaded) return null;



    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor={'#001100'} />
            <NavigationContainer>
                    <Stack.Navigator initialRouteName={(replicas) ? "MainScreen" : "Login"} screenOptions={{headerShown: false}}>
                        <Stack.Screen component={MainScreen} name="MainScreen" initialParams={{replicas: replicas}}/>
                        <Stack.Screen component={LoginForm} name="Login" />
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