import React from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, ScrollView, View } from "react-native";

const KeyboardAvoidingContainer = ({ children }) => {
    return (
        <View style={styles.container}>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    kaContainer: {
        flex: 1,
    },
    container: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1
    }
})
export default KeyboardAvoidingContainer;