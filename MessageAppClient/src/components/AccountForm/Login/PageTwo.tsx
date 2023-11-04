import React, { useState } from "react";
import { StyleSheet, View, Image, Text, TextInput } from "react-native";
import axios from "axios";
import { storage } from "../../Storage";
import { errInputStyle, errLabelStyle } from "../../errorStyle";
import { BaseURL } from "./BaseURL";
import FormButton from "../FormButton";
import FormContainer from "../../FormContainer";
import { OneSignal } from "react-native-onesignal";

const ONESIGNAL_PATCH_SUBSCRIPTION_ALIAS_URL = "https://onesignal.com/api/v1/apps/app_id/subscriptions/subscription_id/owner";


const PageTwo = ({ route, navigation }) => {
    const {username, phoneNumber} = route.params
    function handleForm() {
        const otpCode = firstValue + secondValue + thirdValue + fourthValue + fifthValue + sixthValue;
        console.log(otpCode);
        axios.post(BaseURL + "verify/", {
            "username": username,
            "phone_number": phoneNumber,
            "otp_code": otpCode,
        })
        .then((response) => {
            storage.set("auth", JSON.stringify(response.data));
            OneSignal.login(response.data.user.public_id);
            console.log(response.data.user.public_id);    
            // axios.patch(ONESIGNAL_PATCH_SUBSCRIPTION_ALIAS_URL.replace("app_id", "f3536252-f32f-4823-9115-18b1597b3b1a")
            // .replace("subscription_id", OneSignal.User.pushSubscription.getPushSubscriptionId()), {
            //     "identity": {
            //         "external_id": response.data.user.public_id
            //     }
            // }, {
            //     headers: {
            //         "Accept": "application/json",
            //         "Content-Type": "application/json",
            //     }
            // }).then((response) => console.log(response))
            // .catch((err) => console.log(err.response.data))
            navigation.navigate("MainScreen");
        })
        .catch((e) => {
            console.log(e.response.data)
            setIsFormHandled(true);
            setErrStyle(errInputStyle);
            setLabelText(e.response.data["detail"] || e.response.data["username"]);
        })
    }


    const [firstValue, onChangeFirstValue] = useState("");
    const [isFirstFieldEditable, setIsFirstFieldsEditable] = useState(true);

    const [secondValue, onChangeSecondValue] = useState("");
    const [isSecondFieldEditable, setIsSecondFieldEditable] = useState(true);

    const [thirdValue, onChangeThirdValue] = useState("");
    const [isThirdFieldEditable, setIsThirdFieldEditable] = useState(true);

    const [fourthValue, onChangeFourthValue] = useState("");
    const [isFourthFieldEditable, setIsFourthFieldEditable] = useState(true);

    const [fifthValue, onChangeFifthValue] = useState("");
    const [isFifthFieldEditable, setIsFifthFieldEditable] = useState(true);

    const [sixthValue, onChangeSixthValue] = useState("");
    const [isSixthFieldEditable, setIsSixthFieldEditable] = useState(true);

    const [errStyle, setErrStyle] = useState(null);
    const [labelText, setLabelText] = useState("");
    const [isFormHandled, setIsFormHandled] = useState(false);

    const fields = {first: null, second: null, third: null, fourth: null, fifth: null, sixth: null};

    if (sixthValue && !isFormHandled) {
        handleForm();
    };

    return (
    <FormContainer>
        <View style={styles.topBlock}>
            <Text style={styles.formTitle}>Login</Text>
        </View>
        <View style={styles.mainBlock}>
            <Text style={styles.labelText}>Enter your verification code:</Text>
            <View style={styles.inputContainer}>
                <View style={styles.inputBlock}>
                    <View style={styles.inputHalfBlock}>
                        <TextInput style={[styles.input, errStyle]}
                                keyboardType={"decimal-pad"}
                                maxLength={1}
                                ref={input => fields.first = input}
                                onChangeText={onChangeFirstValue}
                                onChange={() => {
                                    fields.second.focus();
                                    setIsFirstFieldsEditable(false);
                                }}
                                value={firstValue} 
                                editable={isFirstFieldEditable}
                        />                   
                        <TextInput style={[styles.input, errStyle]}
                                keyboardType={"decimal-pad"}
                                ref={input => fields.second = input}
                                onChangeText={onChangeSecondValue}
                                onChange={() => {
                                    fields.third.focus();
                                    setIsSecondFieldEditable(false);
                                }}
                                maxLength={1}
                                value={secondValue}
                                editable={isSecondFieldEditable}
                        />
                        <TextInput style={[styles.input, errStyle]}
                                keyboardType={"decimal-pad"}
                                onChangeText={onChangeThirdValue}
                                ref={input => fields.third = input}
                                onChange={() => {
                                    setIsThirdFieldEditable(false);
                                    fields.fourth.focus();
                                }}
                                maxLength={1}
                                value={thirdValue}
                                editable={isThirdFieldEditable}
                        />
                    </View>
                    <View style={styles.inputHalfBlock}>
                        <TextInput style={[styles.input, errStyle]}
                                keyboardType={"decimal-pad"}
                                ref={input => fields.fourth = input}
                                onChangeText={onChangeFourthValue}
                                onChange={() => {
                                    setIsFourthFieldEditable(false);
                                    fields.fifth.focus();
                                }}
                                maxLength={1}
                                value={fourthValue}
                                editable={isFourthFieldEditable}
                        />
                        <TextInput style={[styles.input, errStyle]}
                                keyboardType={"decimal-pad"}
                                ref={input => fields.fifth = input}
                                onChangeText={onChangeFifthValue}
                                onChange={() => {
                                    setIsFifthFieldEditable(false);
                                    fields.sixth.focus();
                                }}
                                maxLength={1}
                                value={fifthValue}
                                editable={isFifthFieldEditable}
                        />
                        <TextInput style={[styles.input, errStyle]}
                                keyboardType={"decimal-pad"}
                                ref={input => fields.sixth = input}
                                onChange={({nativeEvent}) => {
                                    onChangeSixthValue(nativeEvent.text);
                                    setIsSixthFieldEditable(false);
                                }}
                                maxLength={1}
                                value={sixthValue}
                                editable={isSixthFieldEditable}        
                        />
                    </View>
                </View>
                <Text style={[errLabelStyle, {fontSize: 13}]}>{labelText}</Text>
            </View>
            <View style={styles.buttonBlock}>
                <FormButton text={"Return"} onPress={() => {
                        navigation.goBack();
                    }} 
                />
            </View>
        </View>
    </FormContainer>
    )
}

const styles = StyleSheet.create({
    formTitle: {
        fontSize: 25,
        color: "white",
    },
    logo: {
        height: 30,
        objectFit: "contain",
    },
    topBlock: {
        flex: 0.3,
        justifyContent: "flex-end"
    },
    mainBlock: {
        flex: 0.7,
        width: "60%",
        marginTop: 30,
    },
    labelText: {
        textAlign: "center",
        fontFamily: "Poppins",
        color: "white",
        marginTop: 30,
    },
    inputContainer: {
        marginTop: 30,
        marginBottom: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    inputBlock: {
        paddingTop: 2,
        rowGap: 15,
        borderRadius: 10,
        height: 40,
        columnGap: 10,
        flexDirection: "row",
        marginBottom: 12.5,
    },
    input: {
        textAlign: "center",
        fontFamily: "Poppins",
        borderColor: "white",
        borderWidth: 2,
        borderRadius: 5,
        color: "white",
        fontSize: 16,
        width: 35,
        paddingTop: 2,
        textAlignVertical: "center",
    },
    buttonBlock: {
        flexDirection: "row",
        columnGap: 5,
        justifyContent: "center",
    },
    button: {
        backgroundColor: "#001E41",
        borderRadius: 30,
        paddingTop: 15,
        paddingBottom: 15,
        paddingRight: 30,
        paddingLeft: 30,
    },
    buttonText: {
        color: "white",
        fontSize: 14,
        fontFamily: "Poppins",
    },
    inputHalfBlock: {
        flexDirection: "row",
        columnGap: 5,
    },
});
export default PageTwo;
