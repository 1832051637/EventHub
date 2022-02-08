//import React from 'react';
import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, FlatList, Image, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


import { arrayUnion, arrayRemove, collection, getDocs, getDoc, updateDoc, doc, exists } from "firebase/firestore";
import { db, storage, auth } from '../firebase';
import { getDownloadURL, ref } from 'firebase/storage';

import { getDateString, getTimeString } from '../utils/timestampFormatting';
import styles from '../styles/homeStyle.js';
import myEventsStyle from '../styles/myEventsStyle';


const MyEventsScreen = () => {
    const [data, setData] = useState([]);
    const navigation = useNavigation();


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
                        isAttending: isAttending
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

        const newData = data.map( item => {
            if (item.id === eventId ) {
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
                                item.isAttending ? unattendEvent(item.id) : attendEvent(item.id);
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
