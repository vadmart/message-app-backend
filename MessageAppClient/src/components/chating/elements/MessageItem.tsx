import {Image, Pressable, StyleSheet, Text, View} from "react-native"
import {Message} from "@app/types/MessageType";
import {toReadableDate, toReadableTime} from "@app/components/helpers/chatDatetime";
import Avatar from "@app/components/chating/elements/Avatar";
import React from "react";
import {getFileName} from "@app/components/helpers/file";

const MessageItem = (props) => {
    const {index, messages, item}: { index: number, messages: Message[], item: Message } = props;
    const currentDateTime = new Date(item.created_at);
    const previousDateTime = (index > 0) ? new Date(messages[index - 1].created_at) : new Date(-100);
    const nextDateTime = (index < messages.length - 1) ? new Date(messages[index + 1].created_at) : new Date(-100);
    const nextSender = (index < messages.length - 1) && messages[index + 1].sender;
    return (
        <View>
            {(currentDateTime.getDate() !== previousDateTime.getDate() ||
                    currentDateTime.getMonth() !== previousDateTime.getMonth()) &&
                <View style={styles.dateBlock}>
                    <View style={styles.date}>
                        <Text style={styles.dateText}>{toReadableDate(currentDateTime)}</Text>
                    </View>
                </View>}
            <View style={styles.messageBlock}>
                <View style={styles.leftBlock}>
                    {((currentDateTime.getDate() !== nextDateTime.getDate() ||
                            currentDateTime.getMonth() !== nextDateTime.getMonth())
                        || item.sender.username !== nextSender.username) ?
                        <Avatar user={item.sender}/> : null}
                </View>
                <View style={styles.rightBlock}>
                    <View style={styles.contentTimeBlock}>
                        {(item.file) && <View style={styles.fileBlock}>
                            <Pressable style={{
                                height: 30, backgroundColor: "black", padding: 5, borderRadius: 20
                            }}>
                                <Image source={require("@img/chat-icons/download.png")}
                                       style={{height: "85%", aspectRatio: 1}}
                                       resizeMethod={"resize"}/>
                            </Pressable>
                            <Text style={{paddingLeft: 10}}>{getFileName(item.file)}</Text>
                        </View>}
                        <View style={styles.contentBlock}>
                            <Text style={styles.content}>{item.content}</Text>
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
    leftBlock: {
        flex: 0.15,
        justifyContent: "flex-end",
        alignItems: "center"
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
    fileBlock: {
        flexDirection: "row",
        alignItems: "center"
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