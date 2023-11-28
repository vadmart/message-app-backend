export interface Message {
    public_id: string,
    chat: string,
    sender: string,
    created_at: string,
    edited_at: string,
    is_read: boolean,
    content?: string
}

export interface Chat_ {
    created_at: string,
    first_user: string,
    second_user: string,
    last_message: Message,
    public_id: string,
    unread_messages_count: number
}

export const isAMessage = (obj: any): obj is Message => {
    return "chat" in obj && "sender" in obj && "created_at" in obj && "edited_at" in obj
}

export const isAMessageArray = (obj: any): obj is Message[] => {
    for (let message of obj) {
        if (!("created_at" in message) ||
            !("edited_at" in message) ||
            !("sender" in message) ||
            !("chat" in message) ||
            !("public_id" in message) ||
            !("is_read" in message)) return false
    }
    return true
}



export const isAChatArray = (obj: any): obj is Chat_[] => {
    for (let chat of obj) {
        if (!("created_at" in chat) || !("first_user" in chat) || !("second_user" in chat) || !("last_message" in chat) || !("public_id" in chat)) return false
    }
    return true
}
