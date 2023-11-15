import React, { useState, useRef } from "react";
import { View, StyleSheet, Image, Pressable, Text, TextInput } from "react-native";
import { errInputStyle } from "../../helpers/errorStyle";
import { BaseURL } from "./BaseURL";
import axios from "axios";
import FormButton from "../FormButton";

const CountryCode = "+380";

const PageThree = ({route, navigation}) => {
    const { employeeID, firstname, lastname, password } = route.params || {};
    const [phoneNumber, onChangePhoneNumber] = useState("");
    const [phoneNumberErrStyle, setPhoneNumberErrStyle] = useState(null);
    const [phoneNumberLabelText, setPhoneNumberLabelText] = useState(""); 
    

    function handleForm() {
        if (!phoneNumber) {
            setPhoneNumberErrStyle(errInputStyle);
            setPhoneNumberLabelText("Field cannot be empty.");
            return
        }
        axios.post(BaseURL, {
            "employee_id": employeeID,
            "first_name": firstname,
            "last_name": lastname,
            "password": password,            
            "phone_number": CountryCode + phoneNumber
        })
        .then((response) => {
            console.log(response.data);
            navigation.navigate("RegPageFour", {employeeID: employeeID, firstname: firstname, lastname: lastname, password: password, phoneNumber: CountryCode + phoneNumber});
        })
        .catch((e) => {
            setPhoneNumberErrStyle(errInputStyle);
            setPhoneNumberLabelText(e.response.data["phone_number"]);
            console.log(e.response.data);
        })
    }

    return (
        <View style={styles.container}>
            <View style={styles.topBlock}>
                <Image source={require("../../../../assets/images/registration.png")} style={styles.logo}/>
            </View>
            <View style={styles.mainBlock}>
                <Text style={styles.fullName}>{firstname} {lastname}</Text>
                <View>
                    <View style={[styles.inputBlock, phoneNumberErrStyle]}>
                        <Text style={styles.phoneCode}>+380</Text>
                        <TextInput style={[styles.input, {fontSize: (phoneNumber) ? 18 : 13}]}
                            keyboardType={"decimal-pad"}
                            onChangeText={onChangePhoneNumber}
                            onChange={() => {
                            setPhoneNumberErrStyle(null);
                            setPhoneNumberLabelText(""); 
                            }}
                            placeholder={"Enter your \nphone number"}
                            placeholderTextColor={"#17171729"}
                            value={phoneNumber} 
                        />
                    </View>
                    <Text style={styles.errLabel}>{phoneNumberLabelText}</Text>
                </View>
                <View style={styles.buttonBlock}>
                    <FormButton text={"Return"} onPress={(e) => {
                        navigation.goBack();
                    }} />
                    <FormButton text={"Continue"} onPress={handleForm}/>
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
        flex: 0.3,
        justifyContent: "flex-end"
    },
    mainBlock: {
        flex: 0.7,
        width: "60%",
        marginTop: 30,
    },
    buttonBlock: {
        flexDirection: "row",
        columnGap: 5,
        justifyContent: "center",
        marginTop: 50
    },
    inputBlock: {
        marginTop: 15,
        rowGap: 15,
        paddingTop: 2,
        borderRadius: 10,
        flexDirection: "row",
        backgroundColor: "white",
        alignItems: "center",
    },
    errLabel: {
        color: "red"
    },
    fullName: {
        color: "white",
        fontFamily: "Poppins",
        textAlign: "center",
        marginBottom: 20
    },
    loginBlock: {
        alignItems: "flex-end",
    },
    loginButtonText: {
        color: "#FFFFFF25",
    },
    phoneCode: {
        textAlign: "center",
        textAlignVertical: "center",
        fontFamily: "Poppins",
        fontSize: 18,
        // height: "60%",
        borderRightColor: "black",
        borderRightWidth: 2,
        flex: 0.25,
    },
    input: {
        flex: 0.75,
        paddingLeft: 8,
        height: 50,
        fontFamily: "Poppins",
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
export default PageThree;