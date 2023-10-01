import React from "react";
import axios from "axios";

function getAuthAxios(accessToken) {
    return axios.create({
        headers: {
            Authorization: `Basic ${accessToken}`   
        }
    })
}
