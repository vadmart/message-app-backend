import { ChatInterface } from "../MessageType";

export const sortChats = (firstChat: ChatInterface, secondChat: ChatInterface) => {
    return new Date(secondChat.last_message.created_at).getTime() - new Date(firstChat.last_message.created_at).getTime()
};

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
    return `${dateTime.getDate().toString().padStart(2, "0")}.${dateTime.getMonth().toString().padStart(2, "0")}.${dateTime.getFullYear()} ${toReadableTime(dateTime)}`
}