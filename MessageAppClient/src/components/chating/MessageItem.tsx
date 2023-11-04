import {View, Text, StyleSheet} from "react-native"
import { Message } from "./MessageType";
import { toReadableDate, toReadableTime } from "./helpers/chatDatetime";

const MessageItem = ({index, messages}: {index: number, messages: readonly Message[]}) => {
    console.log("rendering MessageItem:");
    console.log(messages[index]);
    // const [currentDate, currentTime] = item.created_at.split(" ");
    // const previousDate = (index !== 0) && messages[index - 1].created_at.split(" ")[0]; 
    // const nextDate = (index < messages.length - 1) && messages[index + 1].created_at.split(" ")[0];
    // const nextSender = (index < messages.length - 1) && messages[index + 1].sender;
    // console.log(currentDate);
    const currentDateTime = new Date(messages[index].created_at);
    const previousDate = (index > 0) && new Date(messages[index - 1].created_at).getDate(); 
    const nextDate = (index < messages.length - 1) && new Date(messages[index + 1].created_at).getDate();
    const nextSender = (index < messages.length - 1) && messages[index + 1].sender;
    return (
        <View>
            {(currentDateTime.getDate() !== previousDate) ?
            <View style={styles.dateBlock}>
                <View style={styles.date}>
                    <Text style={styles.dateText}>{toReadableDate(currentDateTime)}</Text>
                </View>
            </View> : null}
            <View style={styles.messageBlock}>
                <View style={styles.avatarBlock}>
                    {(currentDateTime.getDate() !== nextDate || messages[index].sender !== nextSender) ? 
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{messages[index].sender[0]}</Text>
                    </View> : null}
                </View>
                <View style={styles.rightBlock}>
                    <View style={styles.contentTimeBlock}>
                        <View style={styles.contentBlock}>
                            <Text style={styles.content}>{messages[index].content}</Text>
                        </View>
                        <View style={styles.timeBlock}>
                            <Text style={styles.time}>{toReadableTime(currentDateTime)}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    messageBlock: {
        marginBottom: 20,
        flexDirection: "row"
    },
    avatarBlock: {
        flex: 0.15,
        justifyContent: "flex-end",
        alignItems: "center"
    },
    avatar: {
        backgroundColor: "#D9D9D9",
        height: 35,
        borderRadius: 50,
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    avatarText: {
        fontSize: 20
    },
    rightBlock: {
        flex: 0.8,
        alignItems: "flex-start"
    },
    contentTimeBlock: {
        borderRadius: 10,
        backgroundColor: "#D9D9D9",
        padding: 10,
    },
    contentBlock: {
        marginRight: 15
    },
    content: {
        fontSize: 16
    },
    timeBlock: {
        alignSelf: "flex-end"
    },
    time: {
        color: "#777777"
    },
    dateBlock: {
        alignItems: "center"
    },
    date: {
        marginBottom: 10
    },
    dateText: {
        color: "#FFFFFF",
        fontSize: 18
    },
});

export default MessageItem