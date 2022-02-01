import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, FlatList, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location'

import { collection, getDocs } from "firebase/firestore";

import { auth, db } from '../firebase';
import styles from '../styles/homeStyle.js';

const EventCard = ({ item }) => {
    return (
        <TouchableOpacity style={[styles.container]}>
            <Text>{item.name}</Text>
            <Text>{item.description}</Text>
        </TouchableOpacity>
    );
}


const FeedScreen = () => {
    const [data, setData] = useState([]);
    const [location, setLocation] = useState([]);

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
                setLocation(JSON.stringify(userLocations[0]));
                //alert("User's Location is " + JSON.stringify(location[0]));

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
                    startTime: docData.startTime,
                    endTime: docData.endTime,
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
        navigation.navigate("Map");
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
            <FlatList
                data={data}
                renderItem={EventCard}
                keyExtractor={(item) => item.id}
            />
        </View>

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
