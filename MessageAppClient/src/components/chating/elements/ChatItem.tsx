import {Pressable, StyleSheet, Text, View} from "react-native";
import {toReadableDateTime} from "@app/components/chating/helpers/chatDatetime";
import {useAuth} from "@app/context/AuthContext";
import React from "react";
import Avatar from "@app/components/chating/elements/Avatar";
import {Chat_} from "@app/types/ChatType";


const ChatItem = ({item, navigation}: {item: Chat_, navigation: any}) => {
    const user = useAuth().authState.user;
    const companion = (item.first_user.username == user.username) ? item.second_user : item.first_user;
    return (
        <Pressable style={styles.message} onPress={(e) => {
            navigation.navigate("Chat", {chatData: item, title: companion});
        }
        }>
            <View style={styles.avatarBlock}>
                <Avatar user={companion} />
            </View>
            <View style={styles.senderTextBlock}>
                <Text
                    style={styles.messageSender}>{companion.username}</Text>
                <Text style={styles.messageText}>{item.last_message.content}</Text>
            </View>
            {item.unread_messages_count != 0 && <View style={styles.unreadCounter}>
                                                    <Text>{(item.unread_messages_count >= 1000) ? "999+" : item.unread_messages_count}</Text>
                                                </View>}
            <View style={styles.dateTimeBlock}>
                <Text style={styles.messageDateTime}>{toReadableDateTime(new Date(item.last_message.created_at))}</Text>
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    message: {
        backgroundColor: "white",
        borderColor: "black",
        flexDirection: "row",
        paddingLeft: 5,
        paddingVertical: 10,
        justifyContent: "space-between"
    },
    avatarBlock: {
        justifyContent: "center",
        paddingLeft: 5
    },
    senderTextBlock: {
        flex: 0.7
    },
    messageSender: {
        fontSize: 20,
        fontWeight: "bold"
    },
    messageText: {
        fontSize: 20,
    },
    unreadCounter: {
        backgroundColor: "orange",
        borderRadius: 50,
        width: 35,
        aspectRatio: 1,
        alignSelf: "center",
        justifyContent: "center",
        alignItems: "center",
        fontWeight: "bold"
    },
    dateTimeBlock: {
        flex: 0.2,
        justifyContent: "center",
        alignItems: "center"
    },
    messageDateTime: {
        textAlign: "center"
    },
    messageData: {
        display: "none"
    },
});
export default ChatItem;