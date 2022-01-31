import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, FlatList} from 'react-native';
import { useNavigation } from '@react-navigation/native';

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
