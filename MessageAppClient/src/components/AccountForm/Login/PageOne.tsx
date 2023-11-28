import React, {useState} from "react";
import { StyleSheet, View, Image, TextInput, Pressable, Text  } from "react-native";
import { errInputStyle, errLabelStyle } from "../../helpers/errorStyle";
import { useAuth } from "@app/context/AuthContext"
import FormButton from "@app/components/AccountForm/FormButton"
import FormLinkButton from "@app/components/AccountForm/FormLinkButton";
import FormContainer from "@app/components/AccountForm/FormContainer";



const LoginPageOne = ({ navigation }) => {
    const [username, onChangeUsername] = useState("");
    const [usernameInputStyle, setUsernameInputStyle] = useState(null);
    const [usernameErrText, setUsernameLabelText] = useState("");
    const [phoneNumber, onChangePhoneNumber] = useState("");
    const [phoneNumberErrStyle, setPhoneNumberErrStyle] = useState(null);
    const [phoneNumberLabelText, setPhoneNumberLabelText] = useState("");
    const [validationErrText, setValidationErrText] = useState("");
    const {onLogin} = useAuth();


    async function handleLoginSubmit(e) {
        if (!username) {
            setUsernameInputStyle(errInputStyle);
            setUsernameLabelText("Field cannot be empty.");
            return
        }
        if (!phoneNumber) {
            setPhoneNumberErrStyle(errInputStyle)
            setPhoneNumberLabelText("Field cannot be empty.");
            return
        }
        const response = await onLogin(username, phoneNumber);
        if (!response.error) {
            navigation.navigate("LoginPageTwo", {username, phoneNumber})
            return response
        }
        if (response.msg.username) {
            setUsernameInputStyle(errInputStyle);
            setUsernameLabelText(response.msg.username);
        } else if (response.msg.phone_number) {
            setPhoneNumberErrStyle(errInputStyle);
            setPhoneNumberLabelText(response.msg.phone_number);
        }
    }

    return (
        <FormContainer>
            <View style={styles.topBlock}>
                <Text style={styles.formTitle}>Login</Text>
            </View>
            <View style={styles.mainBlock}>
                <View style={styles.loginBlock}>
                    <FormLinkButton text={"Registration"} onSubmit={() => navigation.navigate("Registration", {screen: "RegPageOne"})} />
                </View>
                <View style={styles.inputContainer}>
                    <View>
                        <TextInput style={[styles.input, usernameInputStyle]}
                            onChangeText={onChangeUsername}
                            onChange={() => {
                                if (usernameErrText) {
                                    setUsernameInputStyle(null);
                                    setUsernameLabelText("");
                                }
                                if (validationErrText) {
                                    setValidationErrText("");
                                }
                            }}
                            placeholder="Username"
                            placeholderTextColor={usernameInputStyle ? "#FF000025" : "#17171729"}
                            value={username}
                        />
                        <Text style={{color: errInputStyle.color}}>{usernameErrText}</Text>
                    </View>
                    <View style={[styles.phoneInputContainer]}>
                        <View style={[styles.phoneInputBlock, phoneNumberErrStyle]}>
                            <Text style={styles.phoneCode}>+380</Text>
                            <TextInput style={[styles.phoneNumberInput, {fontSize: (phoneNumber) ? 18 : 15}]}
                                keyboardType={"decimal-pad"}
                                onChangeText={onChangePhoneNumber}
                                onChange={() => {
                                    if (phoneNumberLabelText) {
                                        setPhoneNumberErrStyle(false);
                                        setPhoneNumberLabelText("");
                                    }
                                    if (validationErrText) {
                                        setValidationErrText(null);
                                    }
                                }}
                                placeholder={"Enter your phone number"}
                                placeholderTextColor={"#17171729"}
                                value={phoneNumber}
                            />
                        </View>
                        <Text style={{color: errInputStyle.color}}>{phoneNumberLabelText}</Text>
                    </View>
                </View>
                <View style={styles.validationErrBlock}>
                    <Text style={errLabelStyle}>{validationErrText}</Text>
                </View>
                <View style={styles.buttonBlock}>
                    <FormButton text={"Continue"}
                                onPress={handleLoginSubmit}
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
    topBlock: {
        flex: 0.3,
        justifyContent: "flex-end"
    },
    mainBlock: {
        flex: 0.7,
        width: "70%",
        marginTop: 30,
    },
    buttonBlock: {
        flexDirection: "row",
        columnGap: 5,
        justifyContent: "center",
        marginTop: 50,
    },
    inputContainer: {
        marginVertical: 15,
        rowGap: 5,
    },
    loginBlock: {
        alignItems: "flex-end",
    },
    phoneInputContainer: {

    },
    phoneInputBlock: {
        flexDirection: "row",
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: "center",
    },
    phoneCode: {
        textAlign: "center",
        textAlignVertical: "center",
        fontFamily: "Poppins",
        fontSize: 18,
        paddingTop: 5,
        borderRightColor: "black",
        borderRightWidth: 2,
        flex: 0.2,
    },
    phoneNumberInput: {
        height: 50,
        flex: 0.8,
        paddingLeft: 8,
        textAlignVertical: "center"
    },
    input: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 8,
        paddingTop: 10,
        fontSize: 16,
        fontFamily: "Poppins",
        paddingLeft: 25,
        textAlignVertical: "center"
    },
    validationErrBlock: {
        alignItems: "center",
    }
})
export default LoginPageOne;