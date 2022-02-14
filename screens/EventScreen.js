import React from 'react';
import { Alert, Text, TouchableOpacity, View, Image } from 'react-native';
import eventStyles from '../styles/eventStyles';
import { getDateString, getTimeString } from '../utils/timestampFormatting';

function has_property(object, key) {
    return object ? hasOwnProperty.call(object, key) : false;
}

function handleString(str) {
    if (!str) {
        return "N/A";
    }
    return str.toString();
}

function handleDescription(description) {
    if (description == '') {
        return 'This event has no description.'
    }
    return description.toString();
}

const deleteAlert = (itemID, itemName) => {
    Alert.alert(
        "Deleting \"" + itemName + "\"",
        "Are You Sure?",
        [
            {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
            },
            { text: "Delete", onPress: () => deleteEvent(itemID) }
        ]
    )
};

const deleteEvent = (itemID) => {
    console.log("Event deleted!");
};

const EventScreen = ({ route, navigation }) => {
    const event = route.params;
    const displayDate = getDateString(event.startTime, event.endTime);
    const displayTime = getTimeString(event.startTime) + ' - ' + getTimeString(event.endTime);

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
                    <Text style={eventStyles.info}>{handleString(event.location)}</Text>
                </Text>
                <Text>
                    <Text style={eventStyles.category}>Address: </Text>
                    <Text style={eventStyles.info}>{handleString(event.formatted_addr)}</Text>
                </Text>

                <Text>
                    <Text style={eventStyles.category}>Longitude: </Text>
                    <Text style={eventStyles.info}>{handleString(event.lon)}</Text>
                </Text>
                <Text>
                    <Text style={eventStyles.category}>Latitude: </Text>
                    <Text style={eventStyles.info}>{handleString(event.lat)}</Text>
                </Text>
                <Text>
                    <Text style={eventStyles.category}>Total users: </Text>
                    <Text style={eventStyles.info}>{event.total}</Text>
                </Text>
                <View style={eventStyles.separator}></View>
                <Text>
                    <Text style={eventStyles.category}>Description: </Text>
                    <Text style={eventStyles.info}>{handleDescription(event.description)}</Text>
                </Text>
            </View>
        </View>
    );
};

export default EventScreen;
