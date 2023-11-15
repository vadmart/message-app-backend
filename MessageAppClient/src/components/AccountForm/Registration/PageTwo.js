import React, { useState } from "react"
import { 
        TextInput,  
        View, 
        StyleSheet, 
        Image, 
        Platform, 
        Pressable, 
        Text,
        KeyboardAvoidingView,
        ScrollView
    } from "react-native"
import axios from "axios";
import { BaseURL } from "./BaseURL";
import { errInputStyle } from "../../helpers/errorStyle";
import FormLinkButton from "../FormLinkButton";
import FormButton from "../FormButton";


const RegPageTwo = ({ route, navigation }) => {
    const {employeeID} = route.params || {};
    const [firstname, onChangeFirstName] = useState("");
    const [lastname, onChangeLastName] = useState("");
    const [password, onChangePassword] = useState("");
    const [repeatedPassword, onChangeRepeatedPassword] = useState("");
    const [firstnameErrStyle, setFirstnameErrStyle] = useState(null);
    const [firstnameLabelText, setFirstnameLabelText] = useState("");
    const [lastnameErrStyle, setLastnameErrStyle] = useState(null);
    const [lastnameLabelText, setLastnameLabelText] = useState("");
    const [passwordErrStyle, setPasswordErrStyle] = useState(null);
    const [passwordLabelText, setPasswordLabelText] = useState("");
    const [repeatedPasswordErrStyle, setRepeatedPasswordErrStyle] = useState(null);

    function handleForm() {
        if (!firstname) {
            setFirstnameErrStyle(errInputStyle);
            setFirstnameLabelText("Field cannot be empty.")
            return
        }
        if (!lastname) {
            setLastnameErrStyle(errInputStyle);
            setLastnameLabelText("Field cannot be empty.")
            return
        }
        if (!password) {
            setPasswordErrStyle(errInputStyle);
            setPasswordLabelText("Field cannot be empty.")
            return
        }
        if (password != repeatedPassword) {
            setPasswordErrStyle(errInputStyle);
            setRepeatedPasswordErrStyle(errInputStyle);
            setPasswordLabelText("Password and repeated password are not equal.");
            return
        }
        axios.post(BaseURL + "validate_fields/", {
            "employee_id": employeeID,
            "first_name": firstname,
            "last_name": lastname,
            "password": password
        })
        .then(() => {
            navigation.navigate("RegPageThree", {employeeID: employeeID, 
                                                 firstname: firstname, 
                                                 lastname: lastname, 
                                                 password: password
                                                });
        })
        .catch((e) => {
            const data = e.response.data;
            if (data["first_name"]) {
                setFirstnameErrStyle(errInputStyle);
                setFirstnameLabelText(data["first_name"])
            }
            if (data["last_name"]) {
                setLastnameErrStyle(errInputStyle);
                setLastnameLabelText(data["last_name"])
            }
            if (data["password"]) {
                setPasswordErrStyle(errInputStyle);
                setPasswordLabelText(data["password"])
            }
        })
    }

    return (
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.topBlock}>
                    <Image source={require("../../../../assets/images/registration.png")} style={styles.logo} />
                </View>
                <View style={styles.mainBlock}>
                        <View style={styles.loginBlock}>
                            <FormLinkButton text={"Login"} onSubmit={() => navigation.navigate("Login", {screen: "LoginPageOne"})} />
                        </View>
                        <View style={styles.inputContainer}>
                            <View>
                                <TextInput style={[styles.input, firstnameErrStyle]}
                                        onChangeText={onChangeFirstName}
                                        onChange={() => {
                                            setFirstnameErrStyle(null);
                                            setFirstnameLabelText("");
                                        }}
                                        placeholder="Firstname"
                                        placeholderTextColor={"#17171729"}
                                        value={firstname}/>
                                <Text style={styles.errLabel}>{firstnameLabelText}</Text>
                            </View>
                            <View>
                                <TextInput style={[styles.input, lastnameErrStyle]}
                                        onChangeText={onChangeLastName}
                                        onChange={() => {
                                            setLastnameErrStyle(null);
                                            setLastnameLabelText("");
                                        }}
                                        placeholder="Lastname"
                                        placeholderTextColor={"#17171729"}
                                        value={lastname}/>
                                <Text style={styles.errLabel}>{lastnameLabelText}</Text>
                            </View>
                            <View>
                                <TextInput style={[styles.input, passwordErrStyle]}
                                        onChangeText={onChangePassword}
                                        onChange={() => {
                                            setPasswordErrStyle(null);
                                            setRepeatedPasswordErrStyle(null);
                                            setPasswordLabelText("");
                                        }}
                                        secureTextEntry
                                        placeholder="Password"
                                        placeholderTextColor={"#17171729"}
                                        value={password}/>
                                <Text style={styles.errLabel}>{passwordLabelText}</Text>
                            </View>
                            <View>
                                <TextInput style={[styles.input, repeatedPasswordErrStyle]}
                                        onChangeText={onChangeRepeatedPassword}
                                        onChange={() => {
                                            setPasswordErrStyle(null);
                                            setRepeatedPasswordErrStyle(null);
                                            setPasswordLabelText("");
                                        }}
                                        secureTextEntry
                                        placeholder="Repeat password"
                                        placeholderTextColor={"#17171729"}
                                        value={repeatedPassword}/>
                            </View>
                        </View>
                        <View style={styles.buttonBlock}>
                            <FormButton text={"Return"} onPress={() => {
                                navigation.goBack();
                            }} 
                            />
                            <FormButton text={"Continue"} onPress={handleForm}/>
                        </View>
                </View>
            </ScrollView>
    )
}

const styles = StyleSheet.create({
    contentContainer: {
        alignItems: "center",
        backgroundColor: "#003867",
        flexGrow: 1,
    },
    logo: {
        height: 30,
        objectFit: "contain",
        alignSelf: "center",
    },
    topBlock: {
        flex: 0.4,
        justifyContent: "flex-end"
    },
    mainBlock: {
        flex: 0.6,
        paddingLeft: 10,
        paddingRight: 10,
        marginTop: 30,
        alignItems: "stretch",
    },
    buttonBlock: {
        flexDirection: "row",
        columnGap: 5,
        justifyContent: "center",
    },
    inputContainer: {
        marginTop: 15,
        marginBottom: 50,
        justifyContent: "stretch",
        width: "60%",
    },
    loginBlock: {
        alignItems: "flex-end",
    },
    loginButtonText: {
        color: "#FFFFFF25",
    },
    input: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 8,
        paddingTop: 10,
        fontSize: 16,
        // flex: 1,
        width: 250,
        fontFamily: "Poppins",
        paddingLeft: 25,
        textAlignVertical: "center"
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
    errLabel: {
        color: "red",
        paddingBottom: 5,
    }
  });

export default RegPageTwo;