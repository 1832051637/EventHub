import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, FlatList, Image, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import * as Location from 'expo-location'
import { arrayUnion, arrayRemove, collection, getDocs, updateDoc, doc } from "firebase/firestore";

import { db, storage, auth } from '../firebase';
import { getDownloadURL, ref } from 'firebase/storage';

import { getDateString, getTimeString } from '../utils/timestampFormatting';
import styles from '../styles/homeStyle.js';
import feedStyle from '../styles/feedStyle';

const FeedScreen = () => {
    const [data, setData] = useState([]);
    const [location, setLocation] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        (async () => {
            try {
                let userLocations = [];
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setLocation({ longitude: -122.0582, latitude: 36.9881 }); // Set to UCSC as default
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
            const userRef = doc(db, 'users', auth.currentUser.uid);
            let events = [];

            docs.forEach((doc) => {
                let docData = doc.data();

                if (new Date() > new Date(docData.endTime.seconds * 1000)) {
                    return;
                }

                const gsReference = ref(storage, docData.image);
                const isAttending = docData.attendees.some((value) => { return value.id === userRef.id });

                let event = {
                    id: doc.id,
                    name: docData.name,
                    description: docData.description,
                    startTime: new Date(docData.startTime.seconds * 1000),
                    endTime: new Date(docData.endTime.seconds * 1000),
                    location: docData.location,
                    isAttending: isAttending,
                    total: docData.total,
                };

                events.push(new Promise((resolve, reject) => {
                    getDownloadURL(gsReference)
                        .then((url) => {
                            event.image = url;
                            resolve(event);
                        })
                        .catch(() => {
                            resolve(event);
                        });
                }));
            });

            Promise.all(events).then((values) => setData(values.sort((a, b) => (a.startTime > b.startTime) ? 1 : -1)));
        });
    }, []);

    const attendEvent = (eventId) => {
        const eventRef = doc(db, 'events', eventId);
        const userRef = doc(db, 'users', auth.currentUser.uid);

        updateDoc(eventRef, {
            attendees: arrayUnion(userRef)
        });

        updateDoc(userRef, {
            attending: arrayUnion(eventRef)
        });

        const newData = data.map(item => {
            if (item.id === eventId) {
                item.isAttending = true;
                return item
            }
            return item;
        })
        setData(newData);
    }

    const unattendEvent = (eventId) => {
        const eventRef = doc(db, 'events', eventId);
        const userRef = doc(db, 'users', auth.currentUser.uid);

        updateDoc(eventRef, {
            attendees: arrayRemove(userRef)
        });

        updateDoc(userRef, {
            attending: arrayRemove(eventRef)
        });

        const newData = data.map(item => {
            if (item.id === eventId) {
                item.isAttending = false;
                return item
            }
            return item;
        })
        setData(newData);
    }

    const handleMap = () => {
        navigation.navigate("Map", location);
    }

    const EventCard = ({ item }) => {
        const displayDate = getDateString(item.startTime, item.endTime);
        const displayTime = getTimeString(item.startTime) + ' - ' + getTimeString(item.endTime);

        return (
            <TouchableOpacity
                style={feedStyle.card}
                onPress={() => {
                    navigation.navigate("Event Details", item)
                }}
            >
                {feedStyle.image && <Image
                    source={{
                        uri: item.image
                    }}
                    style={feedStyle.image}
                    resizeMode={'cover'}
                />}
                <View style={feedStyle.body}>
                    <View style={feedStyle.heading}>
                        <Text style={feedStyle.title}>{item.name}</Text>
                        <TouchableOpacity
                            onPress={() => {
                                item.isAttending ? unattendEvent(item.id) : attendEvent(item.id);
                            }}
                        >
                            {item.isAttending
                                ? <MaterialCommunityIcons name="minus" size={26} color='rgb(100, 100, 100)' />
                                : <MaterialCommunityIcons name="plus" size={26} color='rgb(100, 100, 100)' />
                            }
                        </TouchableOpacity>
                    </View>
                    <Text style={feedStyle.timestamp}>
                        <MaterialCommunityIcons name="clock-outline" size={16} />
                        {' '}{displayDate} at {displayTime}
                    </Text>
                    <Text numberOfLines={2} style={feedStyle.description}>{item.description}</Text>
                </View>
            </TouchableOpacity>
        );
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
                style={feedStyle.feed}
                data={data}
                renderItem={EventCard}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => (<View style={feedStyle.separator} />)}
            />
        </View >
    );
};



export default FeedScreen;
