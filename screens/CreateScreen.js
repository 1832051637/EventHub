import { useNavigation } from '@react-navigation/native';

import { KeyboardAvoidingView, Keyboard, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase'
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import styles from '../styles/styles.js';
import * as Location from 'expo-location'

const today = new Date();

const CreateScreen = () => {
    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [totalUsers, setTotalUsers] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [date, setDate] = useState(today);
    const [showDate, setShowDate] = useState(false);

    const dateChange = (event, newDate) => {
        setShowDate(false);
        setDate(newDate);
    }

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    return;
                }

                let userLocation = await Location.getLastKnownPositionAsync();

                let userLocations = [];
                let userCords = userLocation.coords;

                userLocations.push({ longitude: JSON.stringify(userCords.longitude), latitude: JSON.stringify(userCords.latitude) });
                //alert("User's Location is " + JSON.stringify(location[0]));
                setEventLocation(JSON.stringify(userLocations[0]))

            }
            catch (error) {
                console.log("error " + error);
            }
        })();
    }, []);

    return (
        <KeyboardAwareScrollView>
            <TextInput
                placeholder='Event Name'
                value={eventName}
                onChangeText={text => setEventName(text)}
                style={styles.input}
                multiline={true}
                scrollEnabled={false}
            />
            <TextInput
                placeholder='Event Description'
                value={eventDescription}
                onChangeText={text => setEventDescription(text)}
                style={styles.input}
                multiline={true}
                scrollEnabled={false}
            />
            <TextInput
                placeholder='Total Users'
                value={totalUsers}
                onChangeText={text => setTotalUsers(text)}
                style={styles.input}
                keyboardType={"number-pad"}
            />
            <TextInput
                placeholder='Event Location'
                value={eventLocation}
                onChangeText={text => setEventLocation(text)}
                style={styles.input}
                multiline={true}
                scrollEnabled={false}
            />
            {
                !showDate ?
                    <TextInput
                        placeholder='Date'
                        value={date.toDateString()}
                        onTouchStart={() => setShowDate(true)}
                        style={styles.input}
                    /> : null

            }
            {
                showDate ? <View>
                    <Text style={styles.calenderText}>Choose a Date</Text>
                    <RNDateTimePicker style={styles.calender} value={date} onChange={dateChange} />
                </View> : null
            }
        </KeyboardAwareScrollView>
    );
};

export default CreateScreen;
