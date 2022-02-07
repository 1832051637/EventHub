import React from 'react';
import { Text, TouchableOpacity, View, Image } from 'react-native';
import eventStyles from '../styles/eventStyles';

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

const EventScreen = ({ route, navigation }) => {
    const event = route.params;
    const displayDate = getDateString(event.startTime, event.endTime);
    const displayTime = getTwelveHourTime(event.startTime) + ' - ' + getTwelveHourTime(event.endTime);

    return (
        <View style={eventStyles.container}>
            <Image
                source={{
                    uri: event.image
                }}
                style={eventStyles.image}
            // resizeMode={'cover'}
            />
            <View style={eventStyles.textContainer}>
                <Text style={eventStyles.title}>
                    {event.name}
                </Text>
                <View style={eventStyles.separator}></View>
                <Text>
                    <Text style={eventStyles.category}>Date: </Text>
                    <Text style={eventStyles.info}>{displayDate}</Text>
                </Text>
                <Text>
                    <Text style={eventStyles.category}>Time: </Text>
                    <Text style={eventStyles.info}>{displayTime}</Text>
                </Text>
                <Text>
                    <Text style={eventStyles.category}>Location: </Text>
                </Text>
                <Text>
                    <Text style={eventStyles.category}>Total users: </Text>
                    <Text style={eventStyles.info}>{event.totalUsers}</Text>
                </Text>
                <View style={eventStyles.separator}></View>
                <Text>
                    <Text style={eventStyles.category}>Description: </Text>
                    <Text style={eventStyles.info}>{event.description}</Text>
                </Text>
            </View>
        </View>
    );
};

export default EventScreen;
