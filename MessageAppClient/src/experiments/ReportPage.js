import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import axios from "axios";
import Report from "./Report";
import { storage } from "./Storage";
const BaseURL = "http:/10.0.2.2:8000/api/v1/";

const ReportPage = () => {
    const userData = {
        employee_id: 15642,
        password: "bolit_hujnia"
    };

    useEffect(() => {
        axios({
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            url: BaseURL + "auth/login/",
            data: userData,
        })
        .then((response) => {
            console.log(`From report page: ${response.data}`);
            storage.set("auth", JSON.stringify(response.data));
        })
        .catch((e) => console.error(e))
    }, [userData]);

    return (
        <Report />
    )
}

const styles = StyleSheet.create();
export default ReportPage;