interface MessageInfo {
    chat: string,
    sender: string, 
    created_at: string,
    edited_at: string
}

export interface Message extends MessageInfo {
    content?: string,
};

export interface ChatInterface {
    created_at: string,
    first_user: string,
    second_user: string,
    last_message: Message,
    public_id: string
}

export const isAMessage = (obj: any): obj is Message => {
    return "chat" in obj && "sender" in obj && "created_at" in obj && "edited_at" in obj
}
