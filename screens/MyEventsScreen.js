//import React from 'react';
import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, FlatList, Image, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useIsFocused } from '@react-navigation/native'

import { arrayUnion, arrayRemove, collection, getDocs, getDoc, updateDoc, doc, exists } from "firebase/firestore";
import { db, storage, auth } from '../firebase';
import { getDownloadURL, ref } from 'firebase/storage';

import { getDateString, getTimeString } from '../utils/timestampFormatting';
import styles from '../styles/styles.js';
import myEventsStyle from '../styles/myEventsStyle';


const MyEventsScreen = () => {
    const [data, setData] = useState([]);
    const navigation = useNavigation();

    const isFocused = useIsFocused()

    useEffect(() => {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        getDoc(userRef).then(docSnap => {
            
            let events = [];

            docSnap.data().attending.forEach(value => {
                let eventRef = doc(db, 'events', value.id);
                
                getDoc(eventRef).then(ds => {
                    let docData = ds.data();

                    if (new Date() > new Date(docData.endTime.seconds * 1000)) {
                        return;
                    }
    
                    const gsReference = ref(storage, docData.image);
                    const isAttending = docData.attendees.some((value) => {return value.id === userRef.id});

                    let event = {
                        id: ds.id,
                        name: docData.name,
                        description: docData.description,
                        startTime: new Date(docData.startTime.seconds * 1000),
                        endTime: new Date(docData.endTime.seconds * 1000),
                        location: docData.location,
                        isAttending: isAttending,
                        total: docData.total,
                        hostToken: docData.hostToken,
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
                    Promise.all(events).then((values) => setData(values.sort((a,b) => (a.startTime > b.startTime) ? 1 : -1)));
                })  
            });  
        })
    }, [isFocused]);



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

        const newData = data.map( item => {
            if (item.id === eventId ) {
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
                style={myEventsStyle.card}
                onPress={() => {
                    navigation.navigate("Event Details", item)
                }}
            >
                {myEventsStyle.image && <Image
                    source={{
                        uri: item.image
                    }}
                    style={myEventsStyle.image}
                    resizeMode={'cover'}
                />}
                <View style={myEventsStyle.body}>
                    <View style={myEventsStyle.heading}>
                        <Text style={myEventsStyle.title}>{item.name}</Text>
                        <TouchableOpacity
                            onPress={() => {
                                item.isAttending ? unattendEvent(item.id) : attendEvent(item.id, item.hostToken, item.name);
                            }}
                        >
                            {item.isAttending 
                                ? <MaterialCommunityIcons name="minus" size={26} color='rgb(100, 100, 100)'/>
                                : <MaterialCommunityIcons name="plus" size={26} color='rgb(100, 100, 100)'/>
                            }
                        </TouchableOpacity>
                    </View>
                    <Text style={myEventsStyle.timestamp}>
                        <MaterialCommunityIcons name="clock-outline" size={16}/>
                        {' '}{displayDate} at {displayTime}
                    </Text> 
                    <Text numberOfLines={2} style={myEventsStyle.description}>{item.description}</Text>
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
    
    // MyEvent screen GUI
    return (
        <View style={styles.container}>
            <Text style={myEventsStyle.catergory}>Attending</Text>
            <FlatList style={myEventsStyle.feed}
                data={data}
                renderItem={EventCard}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => (<View style={myEventsStyle.separator}/>)}
            />
        </View>
    );
};

export default MyEventsScreen;
