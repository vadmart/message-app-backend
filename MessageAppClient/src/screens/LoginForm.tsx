import PageOne from "../components/AccountForm/Login/PageOne";
import PageTwo from "../components/AccountForm/Login/PageTwo";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

const LoginForm = () => {
    return (
        <Stack.Navigator initialRouteName={"LoginPageOne"} screenOptions={ { headerShown: false } }>
            <Stack.Screen component={PageOne} name={"LoginPageOne"} />
            <Stack.Screen component={PageTwo} name={"LoginPageTwo"} />
        </Stack.Navigator>
    )
}

export default LoginForm;