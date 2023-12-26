import {Message} from "@app/types/MessageType";
import {User} from "@app/types/UserType";

export interface Chat_ {
    created_at: string,
    first_user: User,
    second_user: User,
    messages: Message[],
    public_id: string,
    unread_count: number,
    areMessagesFetched?: boolean
}

export const isAChat = (obj: any): obj is Chat_ => {
    return "created_at" in obj &&
           "first_user" in obj &&
           "second_user" in  obj &&
           "messages" in obj &&
           "public_id" in obj &&
           "unread_count" in obj
}

export const isAChatArray = (obj: any): obj is Chat_[] => {
    for (let chat of obj) {
        if (!isAChat(chat)) return false
    }
    return true
}