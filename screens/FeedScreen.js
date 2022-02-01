import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, FlatList, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location'

import { collection, getDocs } from "firebase/firestore";

import { auth, db } from '../firebase';
import styles from '../styles/homeStyle.js';
import feedStyle from '../styles/feedStyle';

const EventCard = ({ item }) => {
    return (
        <TouchableOpacity style={feedStyle.card}>
            <Text style={feedStyle.title}>{item.name}</Text>
            <Text>{item.description}</Text>
            <Text>Start time: {item.startTime.toString()}</Text>
            <Text>End time: {item.endTime.toString()}</Text>
        </TouchableOpacity>
    );
}

const Separator = () => {
    return (
        <View
            style={feedStyle.separator}
        />
    );
}

const FeedScreen = () => {
    const [data, setData] = useState([]);
    const [location, setLocation] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                let userLocations = [];
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setLocation({longitude: -122.0582, latitude: 36.9881 }); // Set to UCSC as default
                } else {
                    let userLocation = await Location.getLastKnownPositionAsync();
                    let userCords = userLocation.coords;
                    userLocations.push({ longitude: userCords.longitude, latitude: userCords.latitude });
                    setLocation(userLocations[0]);
                }
            }
            catch (error) {
                console.log("error " + error);
            }
        })();
    }, []);

    useEffect(() => {
        getDocs(collection(db, "events")).then(docs => {
            let events = [];

            docs.forEach((doc) => {
                let docData = doc.data();

                events.push({
                    id: doc.id,
                    name: docData.name,
                    description: docData.description,
                    startTime: new Date(docData.startTime.seconds * 1000),
                    endTime: new Date(docData.endTime.seconds * 1000),
                    location: docData.location
                });
            });
            setData(events);
        })
    }, []);

    const navigation = useNavigation();

    const handleSignOut = () => {
        auth.signOut().catch(error => alert(error.message))
    }

    const handleMap = () => {
        navigation.navigate("Map", location);
    }

    // Home screen GUI
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={handleMap}
            >
                <Text
                    style={styles.buttonText}
                >View Map</Text>
            </TouchableOpacity>

            <FlatList style={feedStyle.feed}
                data={data}
                renderItem={EventCard}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={Separator}
            />
        </View >

        /*
        <View style={styles.container}>
            <Text>Hello, email: {auth.currentUser?.email}</Text>
            <Text>Welcome to EventHub</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={handleMap}
            >
                <Text
                    style={styles.buttonText}
                >View Map</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={handleSignOut}
            >
                <Text
                    style={styles.buttonText}
                >Sign Out</Text>
            </TouchableOpacity>
        </View>
        */
    );
};

export default FeedScreen;
