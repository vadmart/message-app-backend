import React from "react";
import PageOne from "../components/AccountForm/Registration/PageOne";
import PageTwo from "../components/AccountForm/Registration/PageTwo";
import PageThree from "../components/AccountForm/Registration/PageThree";
import PageFour from "../components/AccountForm/Registration/PageFour";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const RegistrationForm = () => {

    return (
        <Stack.Navigator initialRouteName={"RegPageOne"} screenOptions={ { headerShown: false } }>
            <Stack.Screen name={"RegPageOne"} component={PageOne} options={{title: "Registration 1"}} />
            <Stack.Screen name={"RegPageTwo"} component={PageTwo} options={{title: "Registration 2"}} />
            <Stack.Screen name={"RegPageThree"} component={PageThree} options={{title: "Registration 3"}} />
            <Stack.Screen name={"RegPageFour"} component={PageFour} options={{title: "Registration 4"}} />
        </Stack.Navigator>
    )
}

export default RegistrationForm;