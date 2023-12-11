import {Chat_} from "@app/types/ChatType";

export const sortChats = (firstChat: Chat_, secondChat: Chat_) => {
    return new Date(secondChat.last_message.created_at).getTime() - new Date(firstChat.last_message.created_at).getTime()
};