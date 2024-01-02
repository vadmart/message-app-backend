import React from "react"
import {StyleSheet, View} from "react-native";

const TrafficLight = ({red = false, yellow = false, green = false}:
                      {red?: boolean, yellow?: boolean, green?: boolean}) => {
    return (
        <View style={styles.tlContainer}>
            <View style={[styles.tlCircle, {backgroundColor: red ? "red" : "black"}]}></View>
            <View style={[styles.tlCircle, {backgroundColor: yellow ? "yellow" : "black"}]}></View>
            <View style={[styles.tlCircle, {backgroundColor: green ? "green" : "black"}]}></View>
        </View>
    )
}

const styles = StyleSheet.create({
    tlContainer: {
        flexDirection: "row",
        height: 12,
        columnGap: 1
    },
    tlCircle: {
        borderRadius: 50,
        aspectRatio: 1
    }
});
export default TrafficLight;
