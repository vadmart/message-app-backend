import {Pressable, StyleSheet, Text, View} from "react-native";
import {toReadableDateTime} from "@app/components/helpers/chats";
import {useAuth} from "@app/context/AuthContext";
import React from "react";
import Avatar from "@app/components/chating/Avatar";
import {Chat_} from "@app/types/ChatType";
import {showMessageContent, normalizeMessageText} from "@app/components/helpers/chats";
import ScreenNames from "@app/config";


const ChatItem = ({item, navigation}: {item: Chat_, navigation: any}) => {
    const user = useAuth().authState.user;
    const companion = (item.first_user.username == user.username) ? item.second_user : item.first_user;

    return (
        <Pressable style={styles.message} onPress={(e) => {
            console.log("Navigate to messages' screen, UUID: " + item.public_id);
            navigation.navigate(ScreenNames.MESSAGES_SCREEN, {payload: {chatData: item, title: companion.username}});
        }
        }>
            <View style={styles.avatarBlock}>
                <Avatar user={companion} />
            </View>
            <View style={styles.senderTextBlock}>
                <Text
                    style={styles.messageSender}>{companion.username}</Text>
                <Text style={styles.messageText}>{(item.messages.length > 0) ?
                    showMessageContent(item.messages[item.messages.length - 1]) : ""}</Text>
            </View>
            {(item.unread_count && item.unread_count != 0) ?
                                                <View style={styles.unreadCounter}>
                                                    <Text>{(item.unread_count >= 1000) ? "999+" : item.unread_count}</Text>
                                                </View> : null}
            <View style={styles.dateTimeBlock}>
                <Text style={styles.messageDateTime}>{(item.messages.length > 0) ?
                    toReadableDateTime(new Date(item.messages[item.messages.length - 1].created_at)) : ""}</Text>
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
        flex: 0.65
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
        flex: 0.25,
        justifyContent: "center",
        alignItems: "center",
    },
    messageDateTime: {
        textAlign: "center"
    },
    messageData: {
        display: "none"
    },
});
export default ChatItem;