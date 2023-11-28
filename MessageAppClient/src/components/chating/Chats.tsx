import React, {useEffect} from "react";
import axios from "axios";
import {View, StyleSheet, FlatList} from "react-native";
import {AppBaseURL} from "@app/config";
import {Chat_, isAChatArray, isAMessage} from "@app/components/chating/MessageType";
import ContactSearcher from "@app/components/chating/elements/ContactSearcher";
import ChatItem from "@app/components/chating/elements/ChatItem";
import {NotificationWillDisplayEvent, OneSignal} from "react-native-onesignal";
import {useChat} from "@app/context/ChatContext";

export const sortChats = (firstChat: Chat_, secondChat: Chat_) => {
    return new Date(secondChat.last_message.created_at).getTime() - new Date(firstChat.last_message.created_at).getTime()
};

const updateChats = (event: NotificationWillDisplayEvent, chats: Chat_[]) => {
    if (!isAMessage(event.notification.additionalData)) return
    const message = event.notification.additionalData;
    message.content = event.notification.body;
    for (let i = 0; i < chats.length; ++i) {
        if (chats[i].public_id == message.chat) {
            chats[i].last_message.content = message.content;
            chats[i].last_message.created_at = message.created_at;
            chats[i].last_message.edited_at = message.edited_at;
            chats[i].last_message.is_read = message.is_read
            chats[i].unread_messages_count += 1
            break;
        }
    }
}

const Chats = ({navigation}) => {
    const {chats, setChats} = useChat();

    useEffect(() => {
        axios.get(AppBaseURL + "chat/")
            .then((response) => {
                if (!isAChatArray(response.data)) return
                const sortedChats = response.data.sort(sortChats);
                setChats(sortedChats);
                console.log(chats);
            })
            .catch((e) => console.log(e))
    }, [])

    OneSignal.Notifications.addEventListener("foregroundWillDisplay", (e) => {
        e.preventDefault();
        if (!chats) return;
        updateChats(e, chats);
        setChats(() => [...chats]);
    })


    return (
        <View style={styles.container}>
            <ContactSearcher navigation={navigation}/>
            <FlatList data={chats}
                      renderItem={({item}) => {
                          return (
                              <ChatItem item={item}
                                        navigation={navigation}
                              />
                          )
                      }}
                      extraData={chats}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#007767",
        paddingTop: 10,
        rowGap: 10
    },

})
export default Chats;