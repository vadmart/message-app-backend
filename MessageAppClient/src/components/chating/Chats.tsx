import React, {useEffect} from "react";
import axios from "axios";
import {View, StyleSheet, FlatList} from "react-native";
import {AppBaseURL} from "@app/config";
import {isAMessage} from "@app/types/MessageType";
import {Chat_, isAChatArray} from "@app/types/ChatType";
import ContactSearcher from "@app/components/chating/elements/ContactSearcher";
import ChatItem from "@app/components/chating/elements/ChatItem";
import {NotificationWillDisplayEvent, OneSignal} from "react-native-onesignal";
import {useChat} from "@app/context/ChatContext";
import {useAuth} from "@app/context/AuthContext";
import {User} from "@app/types/UserType";

export const sortChats = (firstChat: Chat_, secondChat: Chat_) => {
    return new Date(secondChat.last_message.created_at).getTime() - new Date(firstChat.last_message.created_at).getTime()
};

const updateChats = (event: NotificationWillDisplayEvent, chats: Chat_[], currUser: User) => {
    if (!isAMessage(event.notification.additionalData)) return
    const message = event.notification.additionalData;
    message.content = event.notification.body;
    for (let i = 0; i < chats.length; ++i) {
        if (chats[i].public_id == message.chat) {
            for (let param in message) {
                chats[i].last_message[param] = message[param]
            }
            if (currUser.username != message.sender.username) {
                chats[i].unread_messages_count += 1;
            }
            break;
        }
    }
}

const Chats = ({navigation}) => {
    console.log("Rendering Chats");
    const {chats, setChats} = useChat();
    const {authState} = useAuth();

    useEffect(() => {
        axios.get(AppBaseURL + "chat/")
            .then((response) => {
                const results = response.data.results;
                if (!isAChatArray(results)) {
                    console.error(`Response has no chats, but instead: ${results}`);
                    return
                }
                const sortedChats = results.sort(sortChats);
                setChats(sortedChats);
            })
            .catch((e) => console.log(e));
    }, [])

    useEffect(() => {
        const handleEventForegroundForChats = (e) => {
            e.preventDefault();
            if (!chats) return;
            updateChats(e, chats, authState.user);
            setChats(() => [...chats]);
        };
        OneSignal.Notifications.addEventListener("foregroundWillDisplay", handleEventForegroundForChats);
        return () => {
            OneSignal.Notifications.removeEventListener("foregroundWillDisplay", handleEventForegroundForChats);
        }
    }, [chats]);

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
                      keyExtractor={(item) => item.public_id}
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