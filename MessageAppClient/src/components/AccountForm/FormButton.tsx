import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

const FormButton = (props) => {
    const { text, onPress } = props;
    return (
        <Pressable style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{text}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: "#001100",
        borderRadius: 30,
        paddingTop: 15,
        paddingBottom: 15,
        paddingRight: 30,
        paddingLeft: 30,
    },
    buttonText: {
        color: "white",
        fontSize: 14,
        fontFamily: "Poppins",
    },
});
export default FormButton;