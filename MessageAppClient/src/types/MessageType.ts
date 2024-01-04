import {User} from "@app/types/UserType";

export interface MessageInfo {
    public_id?: string,
    chat: string,
    sender: User,
    created_at: string,
    is_read: boolean,
    is_edited: boolean,
    hasSendingError?: boolean
}
export interface Message extends MessageInfo {
    content: string
    file?: string,
}

export const isAMessage = (obj: any): obj is Message => {
    return "public_id" in obj &&
           "chat" in obj &&
           "sender" in obj &&
           "created_at" in obj &&
           "is_edited" in obj &&
           "is_read" in obj &&
           "content" in obj
}

export const isAMessageArray = (obj: any): obj is Message[] => {
    for (let message of obj) {
        if (!isAMessage(message)) return false
    }
    return true
}
