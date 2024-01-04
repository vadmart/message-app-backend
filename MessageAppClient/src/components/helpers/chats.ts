import {Message} from "@app/types/MessageType";

export const numToMonth = ["січня",
                           "лютого", 
                           "березня", 
                           "квітня", 
                           "травня", 
                           "червня", 
                           "липня", 
                           "серпня", 
                           "вересня", 
                           "жовтня",
                           "листопада",
                           "грудня"];

export const toReadableTime = (dateTime: Date): string => {
    return `${dateTime.getHours().toString().padStart(2, "0")}:${dateTime.getMinutes().toString().padStart(2, "0")}`
}

export const toReadableDate = (dateTime: Date): string => {
    return `${dateTime.getDate()} ${numToMonth[dateTime.getMonth()]}`
}

export const toReadableDateTime = (dateTime: Date): string => {
    if (!dateTime) return ""
    return `${dateTime.getDate().toString().padStart(2, "0")}.${(dateTime.getMonth() + 1).toString().padStart(2, "0")}.${dateTime.getFullYear()} ${toReadableTime(dateTime)}`
}

export const normalizeMessageText = (content: string): string => {
    if (content.length <= 15)
        return content
    return content.substring(0, 15) + "..."
}

export const showMessageContent = (item: Message): string => {
    if (!item) return ""
    if (item.file && item.content) {
        return `Файл, ${normalizeMessageText(item.content)}`
    } else if (item.file) {
        return "Файл"
    }
    return normalizeMessageText(item.content)
}

