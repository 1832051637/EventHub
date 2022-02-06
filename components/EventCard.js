import React from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import feedStyle from '../styles/feedStyle';

function getDateString(startDate, endDate) {
    let dateString;
    const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const startMonth = month[startDate.getMonth()];
    const endMonth = month[endDate.getMonth()];
    const startDay = startDate.getDate();
    const endDay = endDate.getDate();

    dateString = `${startMonth} ${startDay}`;

    if (startMonth !== endMonth) {
        dateString += ` - ${endMonth} ${endDay}`;

    } else if (startDay !== endDay) {
        dateString += ` - ${endDay}`
    }

    return dateString;
}

function getTwelveHourTime(time) {
    let hours = time.getHours();
    let minutes = time.getMinutes();
    const ampm = hours < 12 ? 'am' : 'pm';
    hours %= 12;
    hours = hours === 0 ? 12 : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    return hours + ':' + minutes + ampm;
}

const EventCard = ({ item }) => {
    const displayDate = getDateString(item.startTime, item.endTime);
    const displayTime = getTwelveHourTime(item.startTime) + ' - ' + getTwelveHourTime(item.endTime);

    return (
        <TouchableOpacity 
            style={feedStyle.card}
            onPress={() => {
                item.navigation.navigate("Event Details", item)
            }}
        >
            <Image
                source={{
                    uri: item.image
                }}
                style={feedStyle.image}
                resizeMode={'cover'}
            />
            <View style={feedStyle.heading}>
                <Text style={feedStyle.title}>{item.name}</Text>
                <Text>
                    <MaterialCommunityIcons name="clock-outline" size={16}/>
                    {' '} {displayDate} at {displayTime}
                </Text>
            </View>  
            <Text>{item.description}</Text>
        </TouchableOpacity>
    );
}

export default EventCard;