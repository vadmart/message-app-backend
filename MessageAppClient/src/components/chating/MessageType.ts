interface MessageInfo {
    chat: string,
    sender: string, 
    created_at: string,
    edited_at: string
}

export interface Message extends MessageInfo {
    content?: string,
};
