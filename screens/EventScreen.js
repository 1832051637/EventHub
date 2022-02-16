import React from 'react';
import { Alert, Text, TouchableOpacity, View, Image } from 'react-native';
import eventStyle from '../styles/eventStyle';
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
        <View style={eventStyle.container}>
            <Image
                source={{
                    uri: event.image
                }}
                style={eventStyle.image}
            // resizeMode={'cover'}
            />
            <View style={eventStyle.textContainer}>
                <Text style={eventStyle.title}>
                    {event.name}
                </Text>
                <View style={eventStyle.separator}></View>
                <Text>
                    <Text style={eventStyle.category}>Date: </Text>
                    <Text style={eventStyle.info}>{displayDate}</Text>
                </Text>
                <Text>
                    <Text style={eventStyle.category}>Time: </Text>
                    <Text style={eventStyle.info}>{displayTime}</Text>
                </Text>
                <Text>
                    <Text style={eventStyle.category}>Location: </Text>
                    <Text style={eventStyle.info}>{handleString(event.location)}</Text>
                </Text>
                <Text>
                    <Text style={eventStyle.category}>Address: </Text>
                    <Text style={eventStyle.info}>{handleString(event.address)}</Text>
                </Text>

                <Text>
                    <Text style={eventStyle.category}>Longitude: </Text>
                    <Text style={eventStyle.info}>{handleString(event.lon)}</Text>
                </Text>
                <Text>
                    <Text style={eventStyle.category}>Latitude: </Text>
                    <Text style={eventStyle.info}>{handleString(event.lat)}</Text>
                </Text>
                <Text>
                    <Text style={eventStyle.category}>Attendee Limit: </Text>
                    <Text style={eventStyle.info}>{event.attendeeLimit}</Text>
                </Text>
                <View style={eventStyle.separator}></View>
                <Text>
                    <Text style={eventStyle.category}>Description: </Text>
                    <Text style={eventStyle.info}>{handleDescription(event.description)}</Text>
                </Text>
            </View>
        </View>
    );
};

export default EventScreen;
