import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { View, StyleSheet, FlatList, Pressable, Text } from "react-native";
import {AppBaseURL} from "../AppBaseURL";
import { storage } from "../components/Storage";
import { Auth } from "../Auth";


const MainScreen = ({route}) => {
    const [replicas, setReplicas] = useState([]);

    useEffect(() => {
        const auth: Auth = JSON.parse(storage.getString("auth"));
        console.log(auth);
        axios.get(AppBaseURL + "chat/", {
            headers: {
                Authorization: `Bearer ${auth.access}`
            }
        })
        .then((response) => {
            setReplicas(response.data);
        })
    }, [])

    return (
        <View style={styles.container}>
            <FlatList data={replicas} 
                    renderItem={({item}) => {
                    return (
                        <Pressable style={styles.message}>
                            <View style={styles.senderTextBlock}>
                                <Text style={styles.messageSender}>{item.sender}</Text>
                                <Text style={styles.messageText}>{item.content}</Text>
                            </View>    
                            <View style={styles.dateBlock}>
                                <Text style={styles.messageDate}></Text>
                            </View>
                        </Pressable>
                    )
                    }}/>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#007767",
        // alignItems: "center"
    },
    message: {
        backgroundColor: "white",
        borderColor: "black",
        borderBottomWidth: 1,
        flexDirection: "row",
        paddingLeft: 5
    },
    senderTextBlock: {},
    messageSender: {
        fontSize: 20,
        fontWeight: "bold"
    },
    messageText: {
        fontSize: 20,
    },
    dateBlock: {},
    messageDate: {}
})
export default MainScreen;