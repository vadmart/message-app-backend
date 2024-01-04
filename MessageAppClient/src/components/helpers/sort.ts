import {Chat_} from "@app/types/ChatType";
import {Message} from "@app/types/MessageType";

export const sortChats = (firstChat: Chat_, secondChat: Chat_) => {
    if (firstChat === undefined || secondChat === undefined) return 0;
    return new Date(secondChat.messages[secondChat.messages.length - 1].created_at).getTime() -
        new Date(firstChat.messages[firstChat.messages.length - 1].created_at).getTime()
};

export const sortMessages = (firstMessage: Message, secondMessage: Message) => {
        return new Date(firstMessage.created_at).getTime() - new Date(secondMessage.created_at).getTime();
    }