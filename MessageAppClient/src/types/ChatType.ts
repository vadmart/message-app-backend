import {Message} from "@app/types/MessageType";

export interface Chat_ {
    created_at: string,
    first_user: string,
    second_user: string,
    last_message: Message,
    public_id: string,
    unread_messages_count: number
}

export const isAChat = (obj: any): obj is Chat_ => {
    return "created_at" in obj &&
           "first_user" in obj &&
           "second_user" in  obj &&
           "last_message" in obj &&
           "public_id" in obj &&
           "unread_messages_count" in obj
}

export const isAChatArray = (obj: any): obj is Chat_[] => {
    for (let chat of obj) {
        if (!isAChat(chat)) return false
    }
    return true
}