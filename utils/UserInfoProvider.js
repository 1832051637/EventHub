import React, { useState, useEffect, createContext } from 'react';
import * as Location from 'expo-location';
import Geohash from 'latlon-geohash';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { db, auth } from '../firebase';
import {  updateDoc, doc } from "firebase/firestore";

export const UserInfoContext = createContext({});

export const UserInfoProvider = ({ children }) => {
    const [location, setLocation] = useState([]);
    const [myGeo, setMyGeo] = useState(null);
    const [pushToken, setPushToken] = useState('');

    useEffect(() => {
        (async () => {
            try {
                let userLocations = [];
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setLocation({ longitude: -122.0582, latitude: 36.9881 }); // Set to UCSC as default
                } else {
                    let userLocation = await Location.getLastKnownPositionAsync();
                    let userCoords = userLocation.coords;
                    userLocations.push({ longitude: userCoords.longitude, latitude: userCoords.latitude });
                    setLocation(userLocations[0]);
                    let geoLoc = Geohash.encode(userCoords.latitude, userCoords.longitude, [3]);
                    setMyGeo(geoLoc);
                }
            }
            catch (error) {
                console.log("error " + error);
            }
        })();
    }, []);

    useEffect(() => {
        registerForPushNotificationsAsync();
    }, []);

    const registerForPushNotificationsAsync = async () => {
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            } else {
                console.log("Notification permissions already granted");
            }

            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }

            console.log("Getting token");
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            setPushToken(token);

            if (existingStatus !== 'granted') {
                const userRef = doc(db, 'users', auth.currentUser.uid);
                updateDoc(userRef, {
                    hostToken: token
                });
            } 

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

    return (
        <UserInfoContext.Provider value={{location, setLocation, myGeo, setMyGeo, pushToken, setPushToken }}>
            {children}
        </UserInfoContext.Provider>
    );
};
