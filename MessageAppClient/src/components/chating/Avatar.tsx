import React from "react";
import {View, StyleSheet, Text, Image} from "react-native";
import {User} from "@app/types/UserType";

const Avatar = ({user}: {user: User}) => {
    return (
        <>
            <View style={styles.avatar}>
                {user.avatar ? <Image source={require("@img/chat-icons/convert.png")} /> :
                    <Text style={styles.avatarText}>{user.username[0]}</Text>}
            </View>
        </>
    )
}
const styles = StyleSheet.create({
    avatar: {
        backgroundColor: "#D9D9D9",
        height: 35,
        borderRadius: 50,
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    avatarText: {
        fontSize: 20
    },
})
export default Avatar;