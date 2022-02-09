import {
    View,
    StyleSheet,
    Text,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView
  } from "react-native";
import React, { useState, useEffect } from "react";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { 
    arrayUnion, 
    arrayRemove, 
    collection,
    getDocs, 
    updateDoc, 
    doc,
} from "firebase/firestore";

import { useNavigation } from '@react-navigation/native';
import { db, storage, auth } from '../firebase';
import { getDownloadURL, ref } from 'firebase/storage';
import { getDateString, getTimeString } from '../utils/timestampFormatting';

import feedStyle from '../styles/feedStyle';
import SearchBar from "../components/SearchBar";


const SearchScreen = () => {
    const [searchPhrase, setSearchPhrase] = useState("");
    const [clicked, setClicked] = useState(false);
    const [eventData, setEventData] = useState([]);
    const [data, setData] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        if (searchPhrase === '') {
            setEventData([]);
        } else {
            let searchPhraseLower = searchPhrase.toLowerCase();
            getDocs(collection(db, "events")).then(docs => {
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
                    };
                    let eventName = event.name.toLowerCase();
                    let eventDescription = event.description.toLowerCase()

                    if (eventName.includes(searchPhraseLower) || 
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
                Promise.all(events).then((values) => setEventData(values.sort((a,b) => (a.startTime > b.startTime) ? 1 : -1)));
            });
        }
    }, [searchPhrase])

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
                                ? <MaterialCommunityIcons name="minus" size={26} color='rgb(100, 100, 100)'/>
                                : <MaterialCommunityIcons name="plus" size={26} color='rgb(100, 100, 100)'/>
                            }
                        </TouchableOpacity>
                    </View>
                    <Text style={feedStyle.timestamp}>
                        <MaterialCommunityIcons name="clock-outline" size={16}/>
                        {' '}{displayDate} at {displayTime}
                    </Text> 
                    <Text numberOfLines={2} style={feedStyle.description}>{item.description}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaView style={styles.root}>
            <SearchBar
                searchPhrase={searchPhrase}
                setSearchPhrase={setSearchPhrase}
                clicked={clicked}
                setClicked={setClicked}
            />
            <FlatList 
                style={feedStyle.feed}
                data={eventData}
                renderItem={EventCard}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => (<View style={feedStyle.separator}/>)}
            />
        </SafeAreaView>
    );
};


export default SearchScreen;

const styles = StyleSheet.create({
    root: {
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        width: "100%",
        marginTop: 20,
        fontSize: 25,
        fontWeight: "bold",
        marginLeft: "10%",
    },
});



