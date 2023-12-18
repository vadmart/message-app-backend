import React, {useRef, useState} from "react"
import axios from "axios";
import { AppBaseURL } from "@app/config";
import {StyleSheet, TextInput, View, Pressable, Image} from "react-native"
import {useChat} from "@app/context/ChatContext";
import chat from "@app/components/chating/Chat";

export function ChatKeyboard({payload=null}) {
    const {setChats} = useChat();
    const [inputtedData, setInputtedData] = useState("");

    const inputFieldRef = useRef(null);

    const createMessage = () =>  {
            axios.post(AppBaseURL + "message/", {
                "content": inputtedData,
                ...payload.chatData ? {chat: payload.chatData.public_id} : {second_user: payload.userData.public_id}
            }).then((response) => {
                console.log(response.data);
                setInputtedData("");
                inputFieldRef.current.clear();
            })
            .catch((err) => {
                console.error(err.response.data);
            })
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