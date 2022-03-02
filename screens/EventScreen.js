import React, { useState, useEffect, useContext} from 'react';
import { Text, View, Image, ScrollView, SafeAreaView, Button, TouchableOpacity } from 'react-native';
import { getDoc, doc } from "firebase/firestore";
import eventStyle from '../styles/eventStyle';
import style from '../styles/style.js';
import { getDateString, getTimeString } from '../utils/timestampFormatting';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { db, auth } from '../firebase';
import LoadingView from '../components/LoadingView';
import { attendEvent, unattendEvent } from '../utils/eventUtils';
import { UserInfoContext } from '../utils/UserInfoProvider';


const EventScreen = ({ route, navigation }) => {
    const [event, setEvent] = useState({});
    const [dateString, setDateString] = useState('');
    const [timeString, setTimeString] = useState('');
    const [loading, setLoading] = useState(true);
    const [host, setHost] = useState(route.params.host);
    const [hostToken, setHostToken] = useState(route.params.hostToken);
    const [eventID, setEventID] = useState(route.params.eventID);
    const [eventName, setEventName] = useState(route.params.eventName);
    const [attending, setAttending] = useState(route.params.isAttending);
    const { pushToken } = useContext(UserInfoContext);

    useEffect(async () => {
        const eventRef = doc(db, 'events', eventID);
        const docData = (await getDoc(eventRef)).data();
        let isAttending = docData.attendees.some((value) => { return value.id === auth.currentUser.uid });
        let hostUserID = docData.host;
        let hostData = (await getDoc(hostUserID)).data();

        if (hostData.pfp == undefined) {
            hostData.pfp = 'https://firebasestorage.googleapis.com/v0/b/event-hub-29d5a.appspot.com/o/defaultProfilePicture.jpg?alt=media&token=acb8706e-8b4a-401d-a29a-85a85add1f53';
        }
        
        const eventData = {
            name: docData.name,
            image: docData.image,
            description: docData.description,
            startTime: new Date(docData.startTime.seconds * 1000),
            endTime: new Date(docData.endTime.seconds * 1000),
            address: docData.address,
            location: docData.location,
            host: hostData.name,
            pfp: hostData.pfp,
            attendees: docData.attendees,
            attendeeLimit: docData.attendeeLimit,
            isAttending: isAttending
        }

        setEvent(eventData);
        setDateString(getDateString(eventData.startTime, eventData.endTime));
        setTimeString(getTimeString(eventData.startTime) + ' - ' + getTimeString(eventData.endTime));
        setLoading(false);
    }, [attending]);

    if (loading) {
        return (<LoadingView />)
    }

    return (
        <SafeAreaView style={style.container}>
            <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'stretch' }}>
                <Image
                    source={{
                        uri: event.image
                    }}
                    style={eventStyle.image}
                    resizeMode={'cover'}
                />
                <View style={eventStyle.mainContainer}>
                    <Text style={eventStyle.title}>
                        {event.name}
                    </Text>
                    <View style={eventStyle.hostContainer}> 
                        <Image
                            source={{
                                uri: event.pfp
                            }}
                            style={eventStyle.pfp}
                            resizeMode={'cover'}
                        />
                        <Text style={eventStyle.hostText}>          
                            {' '}{event.host}
                        </Text>
                    </View>
                    
                    <Text style={eventStyle.description}>
                        {event.description
                            ? event.description
                            : 'This event has no description.'}
                    </Text>
                </View>

                <View style={eventStyle.separator}></View>
                <View style={eventStyle.footerContainer}>
                    <Text style={eventStyle.footerText}>
                        <MaterialCommunityIcons name="clock-outline" size={20} style={eventStyle.icon} />
                        {' '}{dateString} at {timeString}
                    </Text>
                    <Text style={eventStyle.locationText} onPress={() => navigation.push('Map Screen')}>
                        <MaterialCommunityIcons name="map-marker-outline" size={20} style={eventStyle.icon}
                        />
                        {' '}{event.address ? event.location + ", " + event.address : 'N/A'}
                    </Text>

                    <Text style={eventStyle.footerText}>
                        <MaterialCommunityIcons name="account-group-outline" size={20} style={eventStyle.icon} />
                        {' '}{event.attendees.length}
                        {event.attendeeLimit && ' out of ' + event.attendeeLimit}
                        {' '}attending so far
                    </Text>

                </View>
            </ScrollView>
            { !attending && host != auth.currentUser.uid ?
                <TouchableOpacity 
                    style={style.attendButton}
                    onPress={() => {attendEvent(eventID, hostToken, eventName, pushToken, route.params.setData, route.params.data); setAttending(true)}}
                >
                    <Text 
                        style={style.buttonText}
                    > Attend Event
                    </Text>
                </TouchableOpacity> 
                : attending && host != auth.currentUser.uid ?
                <TouchableOpacity 
                    style={style.unAttendButton}
                    onPress={() => {unattendEvent(eventID, pushToken, route.params.setData, route.params.data); setAttending(false)}}
                >
                    <Text 
                        style={style.unAttendButtonText}
                    > Cancel
                    </Text>
                </TouchableOpacity> : null

            }
        </SafeAreaView>
    );
};

export default EventScreen;
