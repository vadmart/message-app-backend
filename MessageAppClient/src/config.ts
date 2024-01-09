import { OneSignal, LogLevel } from "react-native-onesignal";

export const BaseHTTPURL = "https://7b0a-178-150-167-216.ngrok-free.app/api/v1/";

export const BaseWebsocketURL = "wss://7b0a-178-150-167-216.ngrok-free.app/ws/chat/";

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
