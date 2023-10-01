import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { View, StyleSheet, FlatList, Pressable, Text } from "react-native";
import { getReplicasContext } from "../contexts/ReplicasContext";
import {AppBaseURL} from "../AppBaseURL";
import { storage } from "../components/Storage";


const MainScreen = ({route}) => {
    const { replicas } = route.params;
    console.log(replicas);

    return (
        <View style={styles.container}>
            <FlatList data={replicas} 
                    renderItem={({item}) => {
                    return (
                        <Pressable style={styles.messages}>
                            <Text style={styles.messageText}>From: {item.user_from}</Text>
                            <Text style={styles.messageText}>{item.content}</Text>
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
    messages: {
        alignItems: "center", 
        backgroundColor: "white",
        borderColor: "black",
        borderWidth: 1,
        borderRadius: 10,
    },
    messageText: {
        fontSize: 20,
    }
})
export default MainScreen;