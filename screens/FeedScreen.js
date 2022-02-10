import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, FlatList, Image, SafeAreaView, KeyboardAvoidingView, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import * as Device from 'expo-device';
import * as Location from 'expo-location';
import { arrayUnion, arrayRemove, collection, getDocs, updateDoc, doc, orderBy, query, where } from "firebase/firestore";
import { db, storage, auth } from '../firebase';
import { getDownloadURL, ref } from 'firebase/storage';

import SearchBar from "../components/SearchBar";
import { getDateString, getTimeString } from '../utils/timestampFormatting';
import styles from '../styles/styles.js';
import feedStyle from '../styles/feedStyle';
import Geohash from 'latlon-geohash';


const FeedScreen = () => {
    const [data, setData] = useState([]);
    const [searchPhrase, setSearchPhrase] = useState("");
    const [clicked, setClicked] = useState(false);
    const [location, setLocation] = useState([]);
    const [myGeo, setMyGeo] = useState(""); // Geo is short for a geohash (a string used to represent a position based on lat and long)
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
                    let userCoords = userLocation.coords;
                    userLocations.push({ longitude: userCoords.longitude, latitude: userCoords.latitude });
                    setLocation(userLocations[0]);
                    //let geoLoc = geofire.geohashForLocation([userLocation.coords.latitude,userLocation.coords.longitude]);
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
        let searchPhraseLower = searchPhrase.toLowerCase();
        let viewEvents = collection(db, "events");
        const eventQuery = query(viewEvents, where("geoLocation", "==", myGeo));

        getDocs(eventQuery).then(docs => {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            
            let events = [];

            docs.forEach((doc) => {
                let docData = doc.data();
                if (new Date() > new Date(docData.endTime.seconds * 1000)) {
                    return;
                }

                const gsReference = ref(storage, docData.image);
                const isAttending = docData.attendees.some((value) => {return value.id === userRef.id});

                let event = {
                    id: doc.id,
                    name: docData.name,
                    description: docData.description,
                    startTime: new Date(docData.startTime.seconds * 1000),
                    endTime: new Date(docData.endTime.seconds * 1000),
                    location: docData.location,
                    isAttending: isAttending,
                    eventGeo: docData.geoLocation,
                    total: docData.total,
                    hostToken: docData.hostToken,
                };
                
                let eventName = event.name.toLowerCase();
                let eventDescription = event.description.toLowerCase()

                if (searchPhrase === '' || eventName.includes(searchPhraseLower) || 
                    eventDescription.includes(searchPhraseLower)) {

                    // console.log("Event name: " + event.name);
                    // console.log("Description: " + event.description);
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
                }
            });
            // May want to sort by distance or something
            Promise.all(events).then((values) => setData(values.sort((a,b) => (a.startTime > b.startTime) ? 1 : -1)));
        });
    }, [searchPhrase, myGeo])

    const attendEvent = (eventId, hostToken, eventName) => {
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
        });

        sendNotifications(hostToken, eventName);
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
                                item.isAttending ? unattendEvent(item.id) : attendEvent(item.id, item.hostToken, item.name);
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

    const sendNotifications = async (token, eventName) => {
        let message = "Someone has joined your event: " + eventName + "!";

        await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            body: JSON.stringify({ 
                "to": token, 
                "title":"A New Attendee", 
                "body": message 
            }),
            headers: {
                "Content-Type": "application/json"
            },
        }).then((response) => {
            console.log(response.status);
        });
    }

    // Home screen GUI
    return (
        <SafeAreaView style={styles.container}>
            <SearchBar
                searchPhrase={searchPhrase}
                setSearchPhrase={setSearchPhrase}
                clicked={clicked}
                setClicked={setClicked}
            />
            <FlatList
                style={feedStyle.feed}
                data={data}
                renderItem={EventCard}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => (<View style={feedStyle.separator} />)}
                ListFooterComponent={() => (<View style={feedStyle.footer} />)}
            />
        </SafeAreaView>
    );
};



export default FeedScreen;
