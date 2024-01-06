import React, {useEffect, memo} from "react";
import axios from "axios";
import {View, StyleSheet, FlatList, Text} from "react-native";
import {BaseHTTPURL, BaseWebsocketURL} from "@app/config";
import {isAChatArray} from "@app/types/ChatType";
import ContactSearcher from "@app/components/chating/ContactSearcher";
import ChatItem from "@app/components/chating/ChatItem";
import {useChat} from "@app/context/ChatContext";
import {sortChats} from "@app/components/helpers/sort"
import {useAuth} from "@app/context/AuthContext";

// @ts-ignore
const ChatsScreen = memo(({navigation}) => {
    console.log("Rendering ChatsScreen");
    const {chats, setChats} = useChat();
    const {authState} = useAuth();

    useEffect(() => {
        const ws = new WebSocket(BaseWebsocketURL + `?token=${authState.access}`);
        ws.onmessage = (e => {
            setChats(JSON.parse(e.data).chats);
        })
        return () => {
            ws.close();
        }
    }, [])

    return (
        <View style={styles.container}>
            <ContactSearcher navigation={navigation} />
            <FlatList data={chats}
                      renderItem={({item}) => {
                          return (
                              <ChatItem item={item}
                                        navigation={navigation}
                              />
                          )
                      }}
                      keyExtractor={item => item.public_id}
            />
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#007767",
        paddingTop: 10,
        rowGap: 10
    },

})
export default ChatsScreen;