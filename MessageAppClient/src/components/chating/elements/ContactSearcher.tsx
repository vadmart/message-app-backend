import React, {useState} from "react";
import {Image, Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import axios from "axios";
import {AppBaseURL} from "@app/config";

const ContactSearcher = ({navigation}) => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async () => {
    axios.get(AppBaseURL + `user/${encodeURIComponent(phoneNumber)}`)
                        .then((response) => {
                            const userData = response.data
                            axios.get(AppBaseURL + `chat/get_chat_by_user/?phone_number=${encodeURIComponent(phoneNumber)}`)
                                .then((resp) => {
                                    navigation.navigate("Chat", {chatData: resp.data})
                                })
                                .catch((e) => {
                                    navigation.navigate("Chat", {userData: userData})
                                })
                        })
                        .catch((err) => setError(err.response.data["detail"]))
}


    return (
        <View style={styles.phoneNumberBlock}>
            <View style={styles.phoneNumberInputBlock}>
                <TextInput style={styles.phoneNumberInput} keyboardType={"phone-pad"} onChangeText={(text) => {
                    setPhoneNumber(text);
                    if (error) setError("")
                }}/>
                <Pressable style={styles.phoneNumberButton} onPress={() => {

                }}>
                    <Image source={require("@img/chat-icons/submit.png")}
                           style={styles.phoneNumberButtonImage}/>
                </Pressable>
            </View>
            <Text style={styles.phoneNumberError}>{error}</Text>
        </View>
    )

}

const styles = StyleSheet.create({
    phoneNumberBlock: {
        alignSelf: "center",
        width: "70%"
    },
    phoneNumberInputBlock: {
        backgroundColor: "white",
        borderColor: "black",
        flexDirection: "row",
        height: 50,
        borderWidth: 3,
        borderRadius: 10,
        paddingLeft: 10,
    },
    phoneNumberInput: {
        fontSize: 20,
        flex: 0.8
    },
    phoneNumberButton: {
        flex: 0.2,
        alignItems: "center"
    },
    phoneNumberButtonImage: {
        height: "100%",
        aspectRatio: 1
    },
    phoneNumberError: {
        color: "#FF0000",
        paddingLeft: 5
    },
})

export default ContactSearcher;