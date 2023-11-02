import React, { useEffect, useState, useRef, memo } from "react"
import { View, Text, StyleSheet, FlatList, TextInput, Image, Pressable } from "react-native";
import { AppBaseURL } from "../../AppBaseURL";
import { storage } from "../Storage";
import axios from 'axios';
import { Message, ChatInterface } from "./MessageType";


const MessageItem = memo(({item, index, messages}: {item: Message, index: number, messages: readonly Message[]}) => {
    console.log("rendering MessageItem");
    const [currentDate, currentTime] = item.created_at.split(" ");
    const previousDate = (index !== 0) && messages[index - 1].created_at.split(" ")[0]; 
    const nextDate = (index < messages.length - 1) && messages[index + 1].created_at.split(" ")[0];
    const nextSender = (index < messages.length - 1) && messages[index + 1].sender;
    console.log(currentDate);
    return (<View>
            {(currentDate !== previousDate) && <View style={styles.dateBlock}>
                                            <View style={styles.date}>
                                                <Text style={styles.dateText}>{currentDate}</Text>
                                            </View>
                                        </View>}
            <View style={styles.messageBlock}>
                <View style={styles.avatarBlock}>
                {(currentDate !== nextDate || item.sender !== nextSender) && <View style={styles.avatar}>
                                                                        <Text style={styles.avatarText}>{item.sender[0]}</Text>
                                                                      </View>}
                    
                </View>
                <View style={styles.rightBlock}>
                    <View style={styles.contentTimeBlock}>
                        <View style={styles.contentBlock}>
                            <Text style={styles.content}>{item.content}</Text>
                        </View>
                        <View style={styles.timeBlock}>
                            <Text style={styles.time}>{currentTime}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
})

function Chat({route}) {
    console.log("rendering Chat");
    const authData = JSON.parse(storage.getString("auth") || "");
    if (authData.length == 0) return;

    const inputFieldRef = useRef(null);
    const [messages, setMessages] = useState<Message[]>(null);
    const [inputtedData, setInputtedData] = useState("");
    const chatData: ChatInterface = route.params["chatData"];

    useEffect(() => {
        axios.get(AppBaseURL + `message/?chat_id=${chatData.public_id}`, {
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

    function createMessage() {
        axios.post(AppBaseURL + "message/", {
            "content": inputtedData,
            "chat": chatData.last_message.chat
        }, {
            "headers": {
                "Authorization": `Bearer ${authData.access}`
            }
        }).then((response) => {
            console.log(response.data);
            inputFieldRef.current.clear();
        })
        .catch((reason) => {
            console.error(reason);
        })
    }

    
    return (
        <View style={styles.container}>
            <FlatList
            style={{paddingTop: 10}} 
            data={messages}
            renderItem={(props) => {
                return <MessageItem item={props.item} index={props.index} messages={messages}/>
            }}
            />
            <View style={styles.footer}>
                <View style={styles.keyboardBlock}>
                    <TextInput style={styles.keyboard} 
                               ref={inputFieldRef}
                               onChangeText={(text) => {setInputtedData(text)}} 
                               placeholder={"Type some text..."} 
                    />
                </View>
                <View style={styles.optionsBlock}>
                    <Pressable style={styles.sendButton} 
                               onPress={createMessage}
                               disabled={(inputtedData) ? false : true}>
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