import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList } from "react-native";
import { AppBaseURL } from "../../AppBaseURL";
import { storage } from "../Storage";
import axios from 'axios';

function Chat({route}) {
    const [messages, setMessages] = useState(null);

    const strAuthData = storage.getString("auth");
    if (!strAuthData) return
    const authData = JSON.parse(strAuthData);
    useEffect(() => {
        axios.get(AppBaseURL + "message/", {
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
    })

    return (
        <View style={styles.container}>
            <FlatList
            style={{paddingTop: 10}} 
            data={messages}
            renderItem={({item}) => {
                return (
                    <View style={styles.messageBlock}>
                        <View></View>
                        <View>
                            <View>
                                <Text></Text>
                            </View>
                            <View>
                                <Text></Text>
                            </View>
                        </View>
                    </View>
                )
            }}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#007767"
    },
    messageBlock: {
        width: "100%",
        height: 10,
        backgroundColor: "red"
    }
})
export default Chat;