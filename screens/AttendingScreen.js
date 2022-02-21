import React, { useContext, useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, FlatList, Image, SafeAreaView, } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getDoc, doc } from "firebase/firestore";
import { db, auth } from '../firebase';
import { getDateString, getTimeString } from '../utils/timestampFormatting';
import style from '../styles/style.js';
import feedStyle from '../styles/feedStyle';
import { UserInfoContext } from '../utils/UserInfoProvider';
import { attendEvent, unattendEvent, deleteAlert } from '../utils/eventUtils';

const AttendingScreen = () => {
    const { pushToken } = useContext(UserInfoContext);
    const [data, setData] = useState([]);
    const navigation = useNavigation();
    const [refresh, setRefresh] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(async () => {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        let userData = (await getDoc(userRef)).data();

        let events = await Promise.all(userData.attending.map(async (eventRef) => {
            let eventData = (await getDoc(eventRef)).data();

            if (!eventData) return null;
            if (new Date() > new Date(eventData.endTime.seconds * 1000)) return null;

            let isAttending = eventData.attendees.some((value) => {return value.id === userRef.id});

            return {
                id: eventRef.id,
                image: eventData.image,
                name: eventData.name,
                description: eventData.description,
                startTime: new Date(eventData.startTime.seconds * 1000),
                endTime: new Date(eventData.endTime.seconds * 1000),
                address: eventData.address,
                eventGeo: eventData.geoLocation,
                host: eventData.host,
                hostToken: eventData.hostToken,
                attendeeTokens: eventData.attendeeTokens,
                isAttending: isAttending,
            };
        }));

        // Filter out null events
        events = events.filter((event) => event);

        setData(events.sort((a,b) => (a.startTime > b.startTime) ? 1 : -1));
        setLoading(false);
        setRefresh(false);
    }, [refresh]);
    
    const EventCard = ({ item }) => {
        const displayDate = getDateString(item.startTime, item.endTime);
        const displayTime = getTimeString(item.startTime) + ' - ' + getTimeString(item.endTime);
    
        return (
            <TouchableOpacity 
                style={feedStyle.card}
                onPress={() => {
                    navigation.push("Event Details", {eventID: item.id})
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
                                onPress={() => { deleteAlert(item.id, item.name, item.attendeeTokens, setRefresh) }}
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
                    {item.address && <Text style={feedStyle.location}>
                            <MaterialCommunityIcons name="map-marker-outline" size={16} />
                            {' '}{item.address}
                     </Text>}
                    <Text numberOfLines={2} style={feedStyle.description}>{item.description}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    if (loading) {
        return (<LoadingView />)
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

export default AttendingScreen;
