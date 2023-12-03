import React, {createContext, useContext} from "react";
import {Chat_} from "@app/types/MessageType";

const ChatContext = createContext<{
    chats?: Chat_[],
    setChats?: React.Dispatch<React.SetStateAction<Chat_[]>>
}>({});
ChatContext.Consumer

export const useChat = () => {
    return useContext(ChatContext);
}

export const ChatProvider = ({children, value}) => {
    return (
        <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
    )
}
