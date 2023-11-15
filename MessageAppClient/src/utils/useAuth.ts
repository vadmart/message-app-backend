import React, {useEffect, useState} from "react";
import { storage } from "../components/Storage";
import axios from "axios";
import ScreenNames from "../config";
import { AppBaseURL } from "../config";

const useAuth = () => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState("");
    const [refreshed, setRefreshed] = useState(false);
    const [initScreenName, setInitScreenName] = useState(ScreenNames.REGISTRATION);

    useEffect(() => {
        const authDataString = storage.getString("auth");
        if (!authDataString) {
            setLoaded(true);
            return
        }
        const authData = JSON.parse(authDataString);
        console.log(authData);
        axios.post(AppBaseURL + "auth/token/verify/", {
            "token": authData.access
        })
        .then(() => {
            setInitScreenName(ScreenNames.MAIN_SCREEN);
            setLoaded(true);
        })
        .catch((e) => {
            // if status is 401, it means our access token is expired. Trying to get another one.
            if (e.response.status == 401 && e.response.data["code"] == "token_not_valid") {
                axios.post(AppBaseURL + "auth/token/refresh/", {
                    "refresh": authData.refresh
                })
                .then((response) => {
                    authData.access = response.data.access;
                    storage.set("auth", JSON.stringify(authData));
                    setRefreshed(true);
                })
                .catch((e) => {
                    setError(e);
                    setInitScreenName(ScreenNames.LOGIN);
                    setLoaded(true);
                })
            } else {
                setError(e);
                setInitScreenName(ScreenNames.REGISTRATION);
                setLoaded(true);
            }
        })
    }, [refreshed])

    return [loaded, error, initScreenName]
}
export default useAuth;