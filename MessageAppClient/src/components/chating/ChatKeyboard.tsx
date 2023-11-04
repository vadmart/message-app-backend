import React, {useRef, useState} from "react"
import axios from "axios";
import { AppBaseURL } from "../../AppBaseURL";
import {StyleSheet, TextInput, View, Pressable, Image} from "react-native"

export function ChatKeyboard({chatData, authData}) {
    const [inputtedData, setInputtedData] = useState("")
    const inputFieldRef = useRef(null);

    function createMessage() {
        axios.post(AppBaseURL + "message/", {
            "content": inputtedData,
            "chat": chatData.public_id
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
        <>
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
});