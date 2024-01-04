import { OneSignal, LogLevel } from "react-native-onesignal";

export const AppBaseURL = "https://9320-178-150-167-216.ngrok-free.app/api/v1/";

const ScreenNames = {
    REGISTRATION: "Registration",
    LOGIN: "Login",
    MAIN_SCREEN: "MainScreen",
    CHATS_SCREEN: "ChatsScreen",
    MESSAGES_SCREEN: "MessagesScreen"
};
export default ScreenNames;

OneSignal.Debug.setLogLevel(LogLevel.Verbose); // for OneSignal Debugging
OneSignal.initialize("ONESIGNAL_APP_ID");
