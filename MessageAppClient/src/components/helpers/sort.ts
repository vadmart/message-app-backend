import {Chat_} from "@app/types/ChatType";

export const sortChats = (firstChat: Chat_, secondChat: Chat_) => {
    return new Date(secondChat.messages[secondChat.messages.length - 1].created_at).getTime() -
        new Date(firstChat.messages[firstChat.messages.length - 1].created_at).getTime()
};