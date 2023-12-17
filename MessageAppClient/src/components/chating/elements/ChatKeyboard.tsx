import React, {useRef, useState} from "react"
import axios from "axios";
import { AppBaseURL } from "@app/config";
import {StyleSheet, TextInput, View, Pressable, Image} from "react-native"
import {useChat} from "@app/context/ChatContext";
import chat from "@app/components/chating/Chat";

export function ChatKeyboard({chatData=null, userData=null}) {
    const {setChats} = useChat();
    const [inputtedData, setInputtedData] = useState("");

    const inputFieldRef = useRef(null);

    const createMessage = () =>  {
        if (chatData) {
            axios.post(AppBaseURL + "message/", {
                "chat": chatData.public_id,
                "content": inputtedData
            }).then((response) => {
                console.log(response.data);
                setInputtedData("");
                inputFieldRef.current.clear();
            })
            .catch((reason) => {
                console.error(reason);
            })
        }
        else if (userData) {
            axios.post(AppBaseURL + "chat/", {
                "second_user": userData.username,
                "content": inputtedData
            }).then((response) => {
                chatData = response.data;
                console.log(chatData);
                setInputtedData("");
                inputFieldRef.current.clear();
                setChats(chatData);
            })
            .catch((reason) => {
                console.error(reason);
            })
        }
    }
    return (
        <>
            <View style={styles.keyboardBlock}>
                <TextInput style={styles.keyboard}
                            ref={inputFieldRef}
                            onChangeText={(text) => {setInputtedData(text)}}
                            placeholder={"Type some text..."}
                />
            </View>
            <View style={styles.optionsBlock}>
                <Pressable
                            onPress={createMessage}
                            disabled={(!inputtedData)}
                            style={{padding: 3}}>
                    <Image style={styles.buttonIcon} source={require("@img/chat-icons/send.png")} resizeMethod={"resize"} />
                </Pressable>
                <Pressable style={{padding: 3}}>
                    <Image style={styles.buttonIcon} source={require("@img/chat-icons/clip_icon.png")} resizeMethod={"resize"} />
                </Pressable>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    keyboardBlock: {
        flex: 0.9,
        justifyContent: "center",
        paddingLeft: 15
    },
    keyboard: {
        fontSize: 18
    },
    optionsBlock: {
        borderWidth: 1,
        borderColor: "red",
        flex: 0.1,
        justifyContent: "center",
        alignItems: "center",
        // paddingRight: 15,
        flexDirection: "row"
    },
    buttonIcon: {
        height: "85%",
        aspectRatio: 1
    },
});