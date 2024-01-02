import React from "react";
import ReactNativeBlobUtil, {ReactNativeBlobUtilConfig} from "react-native-blob-util"
import {Alert, Image, PermissionsAndroid, Platform, Pressable, StyleSheet, Text, View} from "react-native"
import {Message} from "@app/types/MessageType";
import {toReadableDate, toReadableTime} from "@app/components/helpers/chats";
import Avatar from "@app/components/chating/Avatar";
import {getFileExtension, getFileName} from "@app/components/helpers/file";
import {useAuth} from "@app/context/AuthContext";

const MessageItem = (props) => {
    const {index, messages, item}: { index: number, messages: Message[], item: Message } = props;
    const {authState} = useAuth();
    const currentDateTime = new Date(item.created_at);
    const previousDateTime = (index > 0) ? new Date(messages[index - 1].created_at) : new Date(-100);
    const nextDateTime = (index < messages.length - 1) ? new Date(messages[index + 1].created_at) : new Date(-100);
    const nextSender = (index < messages.length - 1) && messages[index + 1].sender;

    const downloadFile = () => {
        const date = new Date();
        const {config, fs} = ReactNativeBlobUtil;
        const RootDir = fs.dirs.SDCardDir;
        const path =
            RootDir + `file_${Math.floor(date.getTime() + date.getSeconds() / 2)}.${getFileExtension(item.file)}`;
        console.log(path);
        let options: ReactNativeBlobUtilConfig = {
            fileCache: true,
            addAndroidDownloads: {
                path: path,
                description: "Downloading a file...",
                notification: true,
                useDownloadManager: true
            }
        }
        config(options)
            .fetch("GET", item.file)
            .then(res => {
                console.log(res);
                alert('File Downloaded Successfully.');
            })
    }

    const checkPermission = async function (){
        if (Platform.OS === 'ios') {
            downloadFile();
        } else {
            try {
                const granted = await PermissionsAndroid
                    .request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                        {
                            title: "Необхідний доступ до зовнішнього сховища",
                            message: "Додатку необхідний доступ до зовнішнього сховища для збереження даних",
                            buttonPositive: "OK"
                        });
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log("Storage permission granted");
                    downloadFile();
                } else {
                    Alert.alert('Error', 'Storage Permission Not Granted')
                }

            } catch (e) {
                console.log("++++" + e);
            }
        }
    }

    return (
        <View>
            {(currentDateTime.getDate() !== previousDateTime.getDate() ||
                    currentDateTime.getMonth() !== previousDateTime.getMonth()) &&
                <View style={styles.dateBlock}>
                    <View style={styles.date}>
                        <Text style={styles.dateText}>{toReadableDate(currentDateTime)}</Text>
                    </View>
                </View>}
            <View style={{...styles.messageBlock, ...(authState.user.public_id == item.sender.public_id && {flexDirection: "row-reverse"})}}>
                <View style={styles.leftBlock}>
                    {((currentDateTime.getDate() !== nextDateTime.getDate() ||
                            currentDateTime.getMonth() !== nextDateTime.getMonth())
                        || item.sender.username !== nextSender.username) ?
                        <Avatar user={item.sender}/> : null}
                </View>
                <View style={{...styles.rightBlock, ...(authState.user.public_id == item.sender.public_id && {alignItems: "flex-end"})
                }}>
                    <View style={styles.contentTimeBlock}>
                        {(item.file) &&
                            <View style={styles.fileBlock}>
                                <Pressable style={styles.downloadButton} onPress={() => checkPermission()}>
                                    <Image source={require("@img/chat-icons/download.png")}
                                           style={styles.downloadButtonIcon}
                                           resizeMethod={"resize"}/>
                                </Pressable>
                                <Text style={styles.fileName}>{getFileName(item.file)}</Text>
                            </View>}
                        {(item.content) && <Text style={styles.content}>{item.content}</Text>}
                        <Text style={styles.time}>{toReadableTime(currentDateTime)}</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    messageBlock: {
        marginBottom: 20,
        flexDirection: "row"
    },
    leftBlock: {
        flex: 0.15,
        justifyContent: "flex-end",
        alignItems: "center"
    },
    rightBlock: {
        flex: 0.85,
        alignItems: "flex-start"
    },
    contentTimeBlock: {
        borderRadius: 10,
        backgroundColor: "#D9D9D9",
        padding: 10,
        maxWidth: "90%"
    },
    fileBlock: {
        flexDirection: "row",
        alignItems: "center",
        width: "90%"
    },
    fileName: {
        paddingLeft: 10,
    },
    content: {
        fontSize: 16
    },
    time: {
        color: "#777777",
        alignSelf: "flex-end"
    },
    dateBlock: {
        alignItems: "center"
    },
    date: {
        marginBottom: 10
    },
    dateText: {
        color: "#FFFFFF",
        fontSize: 18
    },
    downloadButton: {
        height: 30,
        backgroundColor: "black",
        padding: 5,
        borderRadius: 20
    },
    downloadButtonIcon: {
        height: "85%",
        aspectRatio: 1
    },
});

export default MessageItem