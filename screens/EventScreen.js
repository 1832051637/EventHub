import React, { useState, useEffect, useContext} from 'react';
import { Text, View, Image, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { getDoc, doc } from "firebase/firestore";
import eventStyle from '../styles/eventStyle';
import style from '../styles/style.js';
import { getDateTimeString } from '../utils/timestampFormatting';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { db, auth } from '../firebase';
import LoadingView from '../components/LoadingView';
import { attendEvent, unattendEvent } from '../utils/generalUtils';
import MapView, { Marker } from 'react-native-maps';
import { UserInfoContext } from '../utils/UserInfoProvider';

const eventColor = 'red';

const EventScreen = ({ route, navigation }) => {
    const eventID = route.params.eventID;
    const [event, setEvent] = useState({});
    const [loading, setLoading] = useState(true);
    const [attending, setAttending] = useState(false);
    const { pushToken } = useContext(UserInfoContext);

    // Get the event data from the database
    useEffect(async () => {
        // Search for the event passed in as a param
        const eventRef = doc(db, 'events', eventID);
        const docData = (await getDoc(eventRef)).data();

        let isAttending = docData.attendees.some((value) => { return value.id === auth.currentUser.uid });

        // Get the data from the event host
        let hostRef = docData.host;
        let hostData = (await getDoc(hostRef)).data();
        
        const eventData = {
            name: docData.name,
            image: docData.image,
            description: docData.description,
            startTime: new Date(docData.startTime.seconds * 1000),
            endTime: new Date(docData.endTime.seconds * 1000),
            address: docData.address,
            location: docData.location,
            latitude: docData.lat,
            longitude: docData.lon,
            hostID: hostRef.id,
            hostName: hostData.name,
            hostToken: docData.hostToken,
            pfp: hostData.profilePicture,
            attendees: docData.attendees,
            attendeeLimit: docData.attendeeLimit,
            isAttending: isAttending
        }

        setEvent(eventData);
        setAttending(isAttending);
        setLoading(false);
    }, []);

    // Render loading screen if in loading state
    if (loading) {
        return (<LoadingView />)
    }

    // Event details screen
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
                    <View style={eventStyle.footerTextContainer}>
                        <MaterialCommunityIcons name="clock-outline" size={20} style={eventStyle.icon} />
                        <Text style={eventStyle.footerText}>
                            {getDateTimeString(event.startTime, event.endTime)}
                        </Text>
                    </View>
                    <View style={eventStyle.footerTextContainer}>
                        <MaterialCommunityIcons name="map-marker-outline" size={20} style={eventStyle.icon}/>
                        <Text style={eventStyle.locationText} 
                            onPress={() => navigation.push('Map Screen', {location: {lat: event.latitude, lng: event.longitude}})}>
                            {event.address ? event.address : 'N/A'}
                        </Text>
                    </View>
                    <View style={eventStyle.footerTextContainer}>
                        <MaterialCommunityIcons name="account-group-outline" size={20} style={eventStyle.icon} />
                        <Text style={eventStyle.footerText}>
                            {event.attendees.length}
                            {event.attendeeLimit && ' out of ' + event.attendeeLimit}
                            {' '}attending so far
                        </Text>
                    </View>
                </View>
                <View style={eventStyle.mapContainer}>
                    <MapView style={eventStyle.map} 
                        region={{
                            latitude: event.latitude,
                            longitude: event.longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                    >
                        <Marker 
                            coordinate={{latitude: event.latitude, longitude: event.longitude}}
                            pinColor={eventColor}>
                        </Marker>
                    </MapView>
                </View>
                <View style={[style.buttonContainer, {alignSelf: 'center'}]}>
                    { (event.hostID !== auth.currentUser.uid && !attending) &&
                    <TouchableOpacity 
                        style={style.button}
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
                        (event.hostID !== auth.currentUser.uid && attending) &&
                        <TouchableOpacity 
                            style={style.button}
                            onPress={() => {
                                unattendEvent(eventID, pushToken ); 
                                setAttending(false)
                            }}
                        >
                            <Text 
                                style={style.buttonText}
                            > Unattend Event
                            </Text>
                        </TouchableOpacity> 
                    }
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EventScreen;
