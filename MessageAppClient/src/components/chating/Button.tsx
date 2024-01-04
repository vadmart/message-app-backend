import React from "react";
import {View, Text, Pressable} from "react-native";
import {useChat} from "@app/context/ChatContext";
import {Message} from "@app/types/MessageType";

export const Button = ({text, bgColor, fontColor="black", onPress}: {text: string,
                                                             bgColor: string,
                                                             fontColor?: string,
                                                             onPress: () => void}) => {
    return (
        <Pressable style={{backgroundColor: bgColor,
                           padding: 5,
                           alignItems: "center",
                           justifyContent: "center",
                           borderRadius: 10}}
                   onPress={onPress}>
            <Text style={{color: fontColor, fontWeight: "bold"}}>{text}</Text>
        </Pressable>
    )
}

export const ChangeMessageButton = ({onPress}: {onPress: () => void}) => {
    return <Button text={"Змінити"}
                   bgColor={"rgba(0, 0, 0, 0.0)"}
                   fontColor={"rgb(25, 25, 25)"}
                   onPress={onPress}/>
}

export const DeleteMessageButton = ({onPress}: {onPress: () => void}) => {
    return <Button text={"Видалити"}
                   bgColor={"rgba(0, 0, 0, 0.0)"}
                   fontColor={"rgb(25, 25, 25)"}
                   onPress={onPress}/>
}