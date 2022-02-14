import { useNavigation } from '@react-navigation/native';

import { KeyboardAvoidingView, Keyboard, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase'
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import styles from '../styles/styles.js';
import * as Location from 'expo-location';
import Geocoder from 'react-native-geocoding';

import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import Geohash from 'latlon-geohash';

const today = new Date();

const CreateScreen = () => {

    // Geocoder.init("AIzaSyAKuGciNBsh0rJiuXAvza2LKTl5JWyxUbA", { language: "en" });
    // Location.setGoogleApiKey('AIzaSyA3wSOhQpvy9yDpb0cZXLidft2dNL-4LQ8');

    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [totalUsers, setTotalUsers] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [date, setDate] = useState(today);
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [showDate, setShowDate] = useState(false);
    const [pushToken, setPushToken] = useState('');
    const [imageURL, setImageURL] = useState("gs://event-hub-29d5a.appspot.com/IMG_7486.jpg"); // Default Value
    const [eventCoord, setEventCoord] = useState("");

    useEffect(() => {
        registerForPushNotificationsAsync();
    }, []);

    const registerForPushNotificationsAsync = async () => {
        console.log("Registering token");
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            // console.log(token);
            setPushToken(token);
            const userRef = doc(db, 'users', auth.currentUser.uid);
            updateDoc(userRef, {
                hostToken: token
            });
        } else {
            alert('Must use physical device for Push Notifications');
        }

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }
    };

    const dateChange = (event, newDate) => {
        setShowDate(false);
        setEndTime(newDate);
        setStartTime(newDate);
        setDate(newDate);
    }

    const setDay = (check, newTime) => {
        let day = date.getDate();
        newTime.setDate(day);

        check ? setEndTime(newTime) : setStartTime(newTime);
    }

    const startTimeChange = (event, newTime) => {
        setDay(0, newTime);
    }

    const endTimeChange = (event, newTime) => {
        setDay(1, newTime);
    }

    const addEvent = async () => {
        try {
            // ********************************************************
            // Get the coord of event based on user entered address
            // ********************************************************

            Geocoder.init("AIzaSyAKuGciNBsh0rJiuXAvza2LKTl5JWyxUbA", { language: "en" });
            var location;
            var address;
            await Geocoder.from(eventLocation)
                .then(json => {
                    location = json.results[0].geometry.location;
                    address = json.results[0].formatted_address;

                })
                .catch(error => alert(error));


            alert(address);
            // alert(eventLocation);
            // alert(location.lng);
            // setEventLon(location.lng);
            // alert(eventLon);
            // setEventLat(location.lat);
            // // alert(eventLat);

            const userRef = doc(db, 'users', auth.currentUser.uid);

            // Initialize eventdatas
            const eventData = {
                name: eventName,
                description: eventDescription,
                total: totalUsers,
                location: eventLocation,
                eventDate: date,
                startTime: startTime,
                endTime: endTime,
                image: imageURL,
                geoLocation: Geohash.encode(eventCoord.latitude, eventCoord.longitude, [3]),
                attendees: [userRef],
                host: auth.currentUser.uid,
                attendeeTokens: [],
                lat: location.lat,
                lon: location.lng,
                address: address,
            }

            // Push to firebase Database
            await addDoc(collection(db, "events"), eventData)
                .then((eventRef) => {
                    updateDoc(userRef, {
                        hosting: arrayUnion(eventRef),
                        attending: arrayUnion(eventRef),
                    });
                    updateDoc(eventRef, {
                        hostToken: pushToken
                    });
                })
                .then(resetFields);

        } catch (error) {
            alert(error);
        }
    }

    const resetFields = () => {
        setEventName('');
        setEventDescription('');
        setTotalUsers('');
    }

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    return;
                }

                let userLocation = await Location.getLastKnownPositionAsync();
                // alert(userLocation);
                let userLocations = [];
                let userCoords = userLocation.coords;
                setEventCoord(userCoords);



                userLocations.push({ longitude: JSON.stringify(userCoords.longitude), latitude: JSON.stringify(userCoords.latitude) });
                //alert("User's Location is " + JSON.stringify(location[0]));
                // setEventLocation(JSON.stringify(userLocations[0]))

            }
            catch (error) {
                alert("error " + error);
            }
        })();
    }, []);

    return (
        <KeyboardAwareScrollView contentContainerStyle={{ backgroundColor: 'white' }}>
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
            <View style={{ marginBottom: 20, marginTop: 10, flexDirection: 'row' }}>
                <View>
                    <Text style={styles.calenderText}>Event Start Time</Text>
                    <RNDateTimePicker style={styles.time} value={startTime} mode="time" onChange={startTimeChange} />
                </View>
                <View>
                    <Text style={styles.calenderText}>Event End Time</Text>
                    <RNDateTimePicker style={styles.time} value={endTime} mode="time" onChange={endTimeChange} />
                </View>
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={addEvent}
            >
                <Text
                    style={styles.buttonText}
                >Create Event</Text>
            </TouchableOpacity>
        </KeyboardAwareScrollView >
    );
};

export default CreateScreen;
