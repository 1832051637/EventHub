import React, { useState, useEffect, createContext } from 'react';
import * as Location from 'expo-location';
import Geohash from 'latlon-geohash';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { db, auth } from '../firebase';
import {  updateDoc, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';

export const UserInfoContext = createContext({});

// Context for tracking location and notification information
export const UserInfoProvider = ({ children }) => {
    const [location, setLocation] = useState({ longitude: -122.0582, latitude: 36.9881 });
    const [locationString, setLocationString] = useState('');
    const [myGeo, setMyGeo] = useState('9q9');
    const [pushToken, setPushToken] = useState('');

    useEffect(() => {
        // Gets the user's current location
        (async () => {
            try {
                let userLocations = [];
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setLocation({ longitude: -122.0582, latitude: 36.9881 }); // Set to UCSC as default
                } else {
                    let userLocation = await Location.getLastKnownPositionAsync();
                    if (userLocation) {
                        let userCoords = userLocation.coords;
                        userLocations.push({ longitude: userCoords.longitude, latitude: userCoords.latitude });
                        setLocation(userLocations[0]);

                        let geoLoc = Geohash.encode(userCoords.latitude, userCoords.longitude, [3]);
                        setMyGeo(geoLoc);
                    }
                }
            }
            catch (error) {
                console.log(error);
            }
        })();
    }, []);

    // Registers the user for push notifications
    useEffect(() => {
        registerForPushNotificationsAsync();
    }, []);

    // Asks for push notifications permissions if not already granted
    const registerForPushNotificationsAsync = async () => {
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                return;
            }

            const token = (await Notifications.getExpoPushTokenAsync()).data;
            setPushToken(token);

            // Adds the host token to the user doc in the database
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    const userRef = doc(db, 'users', auth.currentUser.uid);
                    const docRef = (await getDoc(userRef)).data();
                    if (existingStatus !== 'granted' || !docRef.hostToken) {
                        updateDoc(userRef, {
                            hostToken: token
                        });
                    }
                }
            });
        }

        // Android push notifications
        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }
    };

    return (
        <UserInfoContext.Provider value={{location, setLocation, myGeo, setMyGeo, pushToken, setPushToken, locationString, setLocationString }}>
            {children}
        </UserInfoContext.Provider>
    );
};
