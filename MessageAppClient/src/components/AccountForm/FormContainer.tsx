import React from "react";
import { StyleSheet, View } from "react-native";

const FormContainer = ({children}) => {
    return (
        <View style={styles.container}>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#007767",
        flex: 1,
    }
});
export default FormContainer;