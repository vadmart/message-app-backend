import React, { useState } from "react";
import { StyleSheet, View, Image, TextInput, Pressable, Text } from "react-native";
import axios from "axios";
import { errInputStyle } from "../../helpers/errorStyle";
import { BaseURL } from "./BaseURL";
import FormLinkButton from "../FormLinkButton";
import FormButton from "../FormButton";
import capitalize from "../../../utils/capitalize";



const RegPageOne = ({ navigation }) => {
    const [employeeID, onChangeEmployeeID] = useState("");
    const [empIDInputStyle, setEmpIDInputStyle] = useState(null);
    const [empIDErrText, setEmpIDLabelText] = useState("");


    function handleFormPage(e) {
        if (!employeeID) {
            setEmpIDInputStyle(errInputStyle);
            setEmpIDLabelText("Field cannot be empty.")
            return
        }
        axios.post(BaseURL + "validate_fields/", {
            "employee_id": employeeID
        })
            .then(() => {
                // if server returns a JSON with key 'employee_id', it means user has an invalid value of field
                    setEmpIDInputStyle(null);
                    navigation.push("RegPageTwo", {employeeID: employeeID});   
                    return
                }
            )
            .catch((e) => {
                setEmpIDInputStyle(errInputStyle);
                setEmpIDLabelText(capitalize(e.response.data["employee_id"][0]))
            })
    }

    return (
        <View style={styles.container}>
            <View style={styles.topBlock}>
                <Image source={require("../../../../assets/images/registration.png")} style={styles.logo}/>
            </View>
            <View style={styles.mainBlock}>
                <View style={styles.loginBlock}>
                    <FormLinkButton text={"Login"} onSubmit={() => navigation.navigate("Login", {screen: "LoginPageOne"})} />
                </View>
                <View style={styles.inputContainer}>
                    <View>
                        <TextInput style={[styles.input, empIDInputStyle]}
                            keyboardType={"decimal-pad"}
                            onChangeText={onChangeEmployeeID}
                            onChange={() => {
                                if (empIDInputStyle) {
                                    setEmpIDInputStyle(null);
                                }
                                if (empIDErrText) {
                                    setEmpIDLabelText(null);
                                }
                            }}
                            placeholder="Employee-ID"
                            placeholderTextColor={empIDInputStyle ? "#FF000025" : "#17171729"}
                            value={employeeID}
                        />
                        <Text style={{color: errInputStyle.color}}>{empIDErrText}</Text>
                    </View>
                </View>
                <View style={styles.buttonBlock}>
                    <FormButton text={"Continue"} onPress={handleFormPage} />
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#003867",
        flex: 1,
    },
    logo: {
        height: 30,
        objectFit: "contain",
    },
    topBlock: {
        flex: 0.35,
        justifyContent: "flex-end"
    },
    mainBlock: {
        flex: 0.65,
        width: "60%",
        marginTop: 30,
    },
    buttonBlock: {
        flexDirection: "row",
        columnGap: 5,
        justifyContent: "center",
    },
    inputContainer: {
        marginTop: 15,
        marginBottom: 50,
        rowGap: 5,
    },
    loginBlock: {
        alignItems: "flex-end",
    },
    input: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 8,
        paddingTop: 10,
        width: 250,
        fontSize: 16,
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
})
export default RegPageOne;