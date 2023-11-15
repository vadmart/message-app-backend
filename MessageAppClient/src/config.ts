import { OneSignal, LogLevel } from "react-native-onesignal";

export const AppBaseURL = "https://5aff-178-150-167-216.ngrok-free.app/api/v1/";

const ScreenNames = {
    REGISTRATION: "Registration",
    LOGIN: "Login",
    MAIN_SCREEN: "MainScreen"
};
export default ScreenNames;

OneSignal.Debug.setLogLevel(LogLevel.Verbose); // for OneSignal Debugging
OneSignal.initialize("ONESIGNAL_APP_ID");

// Method for listening for notification clicks
OneSignal.Notifications.addEventListener("click", (event) => {
    console.log("OneSignal: notification clicked: ");  
    console.log(event);
})
console.log(OneSignal.User.pushSubscription.getPushSubscriptionId());
