import {Pressable, StyleSheet, Text, View} from "react-native";
import {toReadableDateTime} from "@app/components/chating/helpers/chatDatetime";
import {Chat_} from "@app/components/chating/MessageType";
import type {NativeStackScreenProps} from "@react-navigation/native-stack";
import React from "react";


const ChatItem = ({navigation, item, user}: {navigation, item: Chat_, user: any}) => {
    const companion = (item.first_user == user.username) ? item.second_user : item.first_user

    return (
        <Pressable style={styles.message} onPress={(e, data = item) => {
            navigation.navigate("Chat", {chatData: data, title: companion});
        }
        }>
            <View style={styles.senderTextBlock}>
                <Text
                    style={styles.messageSender}>{companion}</Text>
                <Text style={styles.messageText}>{item.last_message.content}</Text>
            </View>
            <View style={styles.unreadCounter}>
                <Text>{(item.unread_messages_count >= 1000) ? "999+" : item.unread_messages_count}</Text>
            </View>
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