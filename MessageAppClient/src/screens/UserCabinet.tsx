import React from "react";
import { View, Text, StyleSheet, Button } from "react-native"

const UserCabinet = () => {
    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.text}>User Page</Text>
                <Button title="Logout"/>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#003867",
        flex: 0.8
    },
    text: {
        fontSize: 30,
        color: "white"
    }
})
export default UserCabinet