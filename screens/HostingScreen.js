import React, { useContext, useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, FlatList, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getDoc, doc } from "firebase/firestore";
import { db, storage, auth } from '../firebase';
import { getDownloadURL, ref } from 'firebase/storage';
import { getDateString, getTimeString } from '../utils/timestampFormatting';
import style from '../styles/style.js';
import feedStyle from '../styles/feedStyle';
import { UserInfoContext } from '../utils/UserInfoProvider';
import { attendEvent, unattendEvent, deleteAlert } from '../utils/eventUtils';

const HostingScreen = () => {
    const { pushToken } = useContext(UserInfoContext);
    const [data, setData] = useState([]);
    const navigation = useNavigation();
    const [refresh, setRefresh] = useState(false);
    const [eventDeleted, setEventDeleted] = useState(false); 

    useEffect(() => {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        getDoc(userRef).then(docSnap => {
            setEventDeleted(false);
            let events = [];
            docSnap.data().hosting.forEach(eventRef => {
                getDoc(eventRef).then(ds => {
                    let docData = ds.data();
                    if (!docData) return;
                    if (new Date() > new Date(docData.endTime.seconds * 1000)) return;
                    
    
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
                    setRefresh(false);
                })  
            });  
        })
    }, [ eventDeleted, refresh]);
    
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
                                onPress={() => { deleteAlert(item.id, item.name, item.attendeeTokens, setEventDeleted) }}
                            >
                                <MaterialCommunityIcons name="delete" size={26} color='rgb(200, 0, 0)' />
                            </TouchableOpacity>
                        :
                            <TouchableOpacity
                                onPress={() => {
                                    item.isAttending 
                                    ? unattendEvent(item.id, pushToken, setData, data) 
                                    : attendEvent(item.id, item.hostToken, item.name, pushToken, setData, data);
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
    
    // MyEvent screen GUI
    return (
        <SafeAreaView style={style.container}>
            <FlatList 
                style={feedStyle.feed}
                data={data}
                renderItem={EventCard}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => (<View style={feedStyle.separator}/>)}
                ListFooterComponent={() => (<View style={feedStyle.footer} />)}
                refreshing = {refresh}
                onRefresh = {() => setRefresh(true)}
            />
        </SafeAreaView>
    );
};

export default HostingScreen;
