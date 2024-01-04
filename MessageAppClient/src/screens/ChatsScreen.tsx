import React, {useEffect, memo} from "react";
import axios from "axios";
import {View, StyleSheet, FlatList, Text} from "react-native";
import {AppBaseURL} from "@app/config";
import {isAChatArray} from "@app/types/ChatType";
import ContactSearcher from "@app/components/chating/ContactSearcher";
import ChatItem from "@app/components/chating/ChatItem";
import {useChat} from "@app/context/ChatContext";
import {sortChats} from "@app/components/helpers/sort"

// @ts-ignore
const ChatsScreen = memo(({navigation}) => {
    console.log("Rendering ChatsScreen");
    const {chats, setChats} = useChat();

    useEffect(() => {
        axios.get(AppBaseURL + "chat/")
            .then((response) => {
                const results = response.data.results;
                console.log(results);
                if (!isAChatArray(results)) {
                    console.error(`Response has no chats, but instead: ${results}`);
                    return
                }
                setChats(results.sort(sortChats));
            })
            .catch((e) => console.log(e));
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