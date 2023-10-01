import React, { useState, useEffect, useCallback } from "react";
import { storage } from "./Storage";
import { FlatList, View, StyleSheet, Text, Loa } from "react-native";
import axios from "axios";
const BaseURL = "http:/10.0.2.2:8000/api/v1/";

const Rep = (props) => {
    const { shift, startDate, startTime, endTime } = props;
    return (
        <View style={styles.report}>
            <Text style={styles.reportText}>{shift}</Text>
            <Text style={styles.reportText}>{startDate}</Text>
            <Text style={styles.reportText}>{startTime}</Text>
            <Text style={styles.reportText}>{endTime}</Text>
        </View>
    )
}

const useGetReports = () => {
    const [ reports, setReports ] = useState({});
    const [loading, setLoading] = useState(true);
    const [ err, setErr ] = useState(null);
    const { access, refresh } = JSON.parse(storage.getString("auth"));

    console.log(JSON.parse(storage.getString("auth")).access);
    useEffect(() => {
        axios({
            method: "get",
            headers: {
                "Authorization": `Bearer ${access}`
            },
            url: BaseURL + "report"
        })
        .then((response) => {
            setReports(response.data);
            console.log(response.data);
        })
        .catch((e) => {
            console.error(e)
            setErr(e);
        })
        setLoading(false)
}, [])        

    return [reports, loading, err]
}

const Report = () => {
    const [reports, loading, error] = useGetReports();

    if (reports) {
        return (
            <View>
               <FlatList data={reports.results}
                         renderItem={({item}) => <Rep shift={item.shift}
                                                     startDate={item.start_date}
                                                     startTime={item.start_time}/>}
                         keyExtractor={item => item.public_id}
                         contentContainerStyle={styles.reportsContainer}
                        />
            </View>
        )
    }
    return (
            <View>
           { loading ? <ActivityIndicator /> : <Text>{error}</Text> }
            </View>
            )
}

   

const styles = StyleSheet.create({
    reportsContainer: {
        justifyContent: "center",
        alignItems: "center",
        rowGap: 10
    },
    report: {
        alignItems: "center",
        backgroundColor: "gold",
        padding: 10
    },
    reportText: {
        color: "white",
        fontSize: 30
    }
})
export default Report;