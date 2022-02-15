import React, { useState, useEffect } from 'react';
import { Alert, Text, TouchableOpacity, View, FlatList, Image, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useIsFocused } from '@react-navigation/native'
import { arrayUnion, arrayRemove, collection, getDocs, getDoc, updateDoc, doc, exists, deleteDoc } from "firebase/firestore";
import { db, storage, auth } from '../firebase';
import { getDownloadURL, ref } from 'firebase/storage';
import { getDateString, getTimeString } from '../utils/timestampFormatting';
import style from '../styles/style.js';
import feedStyle from '../styles/feedStyle';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';


const MyEventsScreen = () => {
    const [data, setData] = useState([]);
    const [pushToken, setPushToken] = useState('');
    const navigation = useNavigation();

    const isFocused = useIsFocused()
    const [eventDeleted, setEventDeleted] = useState(false); 

    useEffect(() => {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        getDoc(userRef).then(docSnap => {
            setEventDeleted(false);
            let events = [];

            docSnap.data().attending.forEach(value => {
                let eventRef = doc(db, 'events', value.id);
                
                getDoc(eventRef).then(ds => {
                    let docData = ds.data();

                    if (new Date() > new Date(docData.endTime.seconds * 1000)) {
                        return;
                    }
    
                    const gsReference = ref(storage, docData.image);
                    let isAttending = docData.attendees.some((value) => {return value.id === userRef.id});

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
                        host: docData.host
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
    }, [isFocused, eventDeleted]);

    useEffect(() => {
        registerForPushNotificationsAsync();
    }, []);

    const registerForPushNotificationsAsync = async () => {
        console.log("Registering token");
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            // console.log(token);
            setPushToken(token);
            const userRef = doc(db, 'users', auth.currentUser.uid);
            updateDoc(userRef, {
                hostToken: token
            });
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

    const attendEvent = (eventId, hostToken, eventName) => {
        const eventRef = doc(db, 'events', eventId);
        const userRef = doc(db, 'users', auth.currentUser.uid);

        updateDoc(eventRef, {
            attendees: arrayUnion(userRef),
            attendeeTokens: arrayUnion(pushToken),
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
            attendees: arrayRemove(userRef),
            attendeeTokens: arrayRemove(pushToken),
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

    const deleteAlert = (itemID, itemName, attendeeTokens) =>{
        Alert.alert(
        "Deleting \"" + itemName + "\"",
        "Are You Sure?",
        [
            {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel"
            },
            { text: "Delete", onPress: () => deleteEvent(itemID, attendeeTokens) }
        ]
        )
    };

    const deleteEvent = (itemID, tokens) =>{
        deleteDoc(doc(db, 'events', itemID))
        .then(() => {
            console.log("Event has been deleted");
            if(tokens && tokens.length > 0) {
                let message = eventName + " has been cancelled by the host.";
                fetch("https://exp.host/--/api/v2/push/send", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ 
                        "to": tokens, 
                        "title":"Event Cancellation", 
                        "body": message 
                    }),
                }).then((response) => {
                    console.log(response.status);
                });
            }
            setEventDeleted(true);
        })
        .catch(e => console.log('Error deleting event.' , e))
    };

    
    const EventCard = ({ item }) => {
        const displayDate = getDateString(item.startTime, item.endTime);
        const displayTime = getTimeString(item.startTime) + ' - ' + getTimeString(item.endTime);
    
        return (
            <TouchableOpacity 
                style={feedStyle.card}
                onPress={() => {
                    navigation.push("Event Details", item)
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
                        {auth.currentUser.uid === item.host 
                        ?
                            <TouchableOpacity
                                onPress={() => {deleteAlert(item.id, item.name, item.attendeeTokens)}}
                            >
                                <MaterialCommunityIcons name="delete" size={26} color='rgb(200, 0, 0)' />
                            </TouchableOpacity>
                        :
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
                        }
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

    const sendNotifications = async (token, eventName) => {
        let message = "Someone has joined your event: " + eventName + "!";

        await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                "to": token, 
                "title":"A New Attendee", 
                "body": message 
            }),
        }).then((response) => {
            console.log(response.status);
        });
    }
    
    // MyEvent screen GUI
    return (
        <View style={style.container}>
            <Text style={style.title}>Attending</Text>
            <FlatList style={feedStyle.feed}
                data={data}
                renderItem={EventCard}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => (<View style={feedStyle.separator}/>)}
            />
        </View>
    );
};

export default MyEventsScreen;
