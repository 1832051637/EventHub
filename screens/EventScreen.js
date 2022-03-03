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
    const eventID = route.params.eventID;
    const [event, setEvent] = useState({});
    const [dateString, setDateString] = useState('');
    const [timeString, setTimeString] = useState('');
    const [loading, setLoading] = useState(true);
    const [attending, setAttending] = useState(false);
    const { pushToken } = useContext(UserInfoContext);

    useEffect(async () => {
        const eventRef = doc(db, 'events', eventID);
        const docData = (await getDoc(eventRef)).data();

        let isAttending = docData.attendees.some((value) => { return value.id === auth.currentUser.uid });
        
        let hostUserID = docData.host;
        let hostData = (await getDoc(hostUserID)).data();
        
        const eventData = {
            name: docData.name,
            image: docData.image,
            description: docData.description,
            startTime: new Date(docData.startTime.seconds * 1000),
            endTime: new Date(docData.endTime.seconds * 1000),
            address: docData.address,
            location: docData.location,
            hostID = hostUserID,
            hostName: hostData.name,
            hostToken: docData.hostToken,
            pfp: hostData.profilePicture,
            attendees: docData.attendees,
            attendeeLimit: docData.attendeeLimit,
            isAttending: isAttending
        }

        setEvent(eventData);
        setAttending(isAttending);
        setDateString(getDateString(eventData.startTime, eventData.endTime));
        setTimeString(getTimeString(eventData.startTime) + ' - ' + getTimeString(eventData.endTime));
        setLoading(false);
    }, []);

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
                            {' '}{event.hostName}
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
            { (!attending && event.hostID != auth.currentUser.uid) &&
                <TouchableOpacity 
                    style={style.attendButton}
                    onPress={() => {
                        attendEvent(eventID, event.hostToken, event.name, pushToken); 
                        setAttending(true)
                    }}
                >
                    <Text 
                        style={style.buttonText}
                    > Attend Event
                    </Text>
                </TouchableOpacity> 
            }
            {
                (attending && event.hostID != auth.currentUser.uid) &&
                <TouchableOpacity 
                    style={style.unAttendButton}
                    onPress={() => {
                        unattendEvent(eventID, pushToken ); 
                        setAttending(false)
                    }}
                >
                    <Text 
                        style={style.unAttendButtonText}
                    > Cancel
                    </Text>
                </TouchableOpacity> 

            }
        </SafeAreaView>
    );
};

export default EventScreen;
