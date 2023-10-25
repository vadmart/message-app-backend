import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TextInput, Image, Pressable } from "react-native";
import { AppBaseURL } from "../../AppBaseURL";
import { storage } from "../Storage";
import axios from 'axios';
import { Message } from "./MessageType";

function Chat({route}) {
    const [messages, setMessages] = useState(null);
    const chatData = route.params["chatData"];

    const strAuthData = storage.getString("auth");
    if (!strAuthData) return
    const authData = JSON.parse(strAuthData);
    useEffect(() => {
        axios.get(AppBaseURL + `message/?chat_id=${chatData["chat"]}`, {
            headers: {
                Authorization: `Bearer ${authData.access}`
            }
        })
        .then((response) => {
            setMessages(response.data);
        })
        .catch((e) => {
            console.log(e);
        })
    }, [])

    return (
        <View style={styles.container}>
            <FlatList
            style={{paddingTop: 10}} 
            data={messages}
            renderItem={({item}: {item: Message}) => {
                const [date, time] = item.created_at.split(" ");
                return (
                    <View>
                        <View style={styles.dateBlock}>
                            <View style={styles.date}>
                                <Text style={styles.dateText}>{date}</Text>
                            </View>    
                        </View>
                        <View style={styles.messageBlock}>
                            <View style={styles.avatarBlock}>
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>f</Text>
                                </View>
                            </View>
                            <View style={styles.rightBlock}>
                                <View style={styles.contentTimeBlock}>
                                    <View style={styles.contentBlock}>
                                        <Text style={styles.content}>{item.content}</Text>
                                    </View>
                                    <View style={styles.timeBlock}>
                                        <Text style={styles.time}>{time}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                )
            }}
            />
            <View style={styles.footer}>
                <View style={styles.keyboardBlock}>
                    <TextInput style={styles.keyboard} placeholder={"Type some text..."} />
                </View>
                <View style={styles.optionsBlock}>
                    <Pressable style={styles.sendButton}>
                        <Image style={styles.sendButtonIcon} source={require("../../../assets/chat-icons/send.png")} resizeMethod={"resize"} />
                    </Pressable>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#007767"
    },
    messageBlock: {
        marginBottom: 20,
        // borderWidth: 1,
        flexDirection: "row"
    },
    avatarBlock: {
        flex: 0.15,
        justifyContent: "flex-end",
        alignItems: "center"
    },
    avatar: {
        backgroundColor: "#D9D9D9",
        // flex: 0.6,
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
        flex: 0.85,
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
    footer: {
        backgroundColor: "#FFFFFF",
        height: 45,
        flexDirection: "row"
    },
    keyboardBlock: {
        flex: 0.9,
        justifyContent: "center",
        paddingLeft: 15
    },
    keyboard: {
        fontSize: 18
    },
    optionsBlock: {
        flex: 0.1,
        justifyContent: "center",
        alignItems: "center",
        paddingRight: 5
    },
    sendButton: {
        objectFit: "fill",
        aspectRatio: 1
    },
    sendButtonIcon: {
        height: "85%",
        width: "85%"
    }
})
export default Chat;