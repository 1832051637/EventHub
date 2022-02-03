import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import eventStyles from '../styles/eventStyles';

const EventScreen = ({ route, navigation }) => {
    const event = route.params;
    return (
        <View style={eventStyles.container}>
            <View style={eventStyles.textContainer}>
                <Text>
                    The event title should be here:
                </Text>
                <Text style={eventStyles.title}>
                    {event.name}
                </Text>
                <Text>
                    More details are coming soon...
                </Text>
            </View>
        </View>
    );
};

export default EventScreen;
