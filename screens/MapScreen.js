import { Text, SafeAreaView, View, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import MapView, { Callout, Circle, Marker } from 'react-native-maps';
import mapStyle from '../styles/mapStyle';
import Geocoder from 'react-native-geocoding';
import Geohash from 'latlon-geohash';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from '../firebase';
import { UserInfoContext } from '../utils/UserInfoProvider';
import LocationBar from "../components/LocationBar";
import { getDistance } from 'geolib';
import { GOOGLE_MAPS_API_KEY, MAP_API_KEY } from '@env';

const MapScreen = ({ route }) => {
    const navigation = useNavigation();
    const { location, setLocation, setMyGeo, locationString, setLocationString } = useContext(UserInfoContext);
    const [address, setAddress] = React.useState({
        streetAddress: "",
        city: "",
        stateZip: "",
        fullAddress: ""
    });
    const [locationPhrase, setLocationPhrase] = useState('');
    const [eventsArray, setEventsArray] = useState([]);
    const [searchRadius, setRadius] = useState(2000);
    const [eventLocation, setEventLocation] = useState(null);
    const userColor = 'red';
    const eventColor = '#ffe01a';
    Geocoder.init(`${GOOGLE_MAPS_API_KEY}`, { language: "en" });

    // Finds the address corresponding the set location
    const searchInitial = () => {
        let gc_start = "https://api.mapbox.com/geocoding/v5/mapbox.places/";
        let gc_end = ".json?country=US&access_token=";
        let geocoding_request = gc_start.concat(location.longitude, ',', location.latitude, gc_end, `${MAP_API_KEY}`);

        fetch(geocoding_request).then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(response);
            }
        }).then(function (result) {
            let addressResult = result.features[0].place_name;

            const addressArray = addressResult.split(", ");
            setAddress({
                streetAddress: addressArray[0],
                city: addressArray[1],
                stateZip: addressArray[2],
                regionOrCountry: addressArray[3],
                fullAddress: addressResult,
            });
        }).catch(function (error) {
            console.warn(error);
        });
    }

    useEffect(() => {
        searchInitial();
        loadEvents();
    }, [location])

    React.useEffect(() => {
        if (route.params) {
            setEventLocation(route.params.location);
        }
    }, [])


    // ********************************************************
    // Reset the marker based on user entered location
    // ********************************************************
    const handleNewLocation = async () => {
        if (!locationPhrase) return;
        let json;

        try {
            json = await Geocoder.from(locationPhrase)

        } catch (error) {
            alert("Invalid Location. Please enter again!");
            return;
        }

        const newLocation = json.results[0].geometry.location;
        const formatted_address = json.results[0].formatted_address;
        const addressArray = formatted_address.split(", ");

        // Update context and state variables with new location
        try {
            setMyGeo(Geohash.encode(newLocation.lat, newLocation.lng, [3]));

            setLocation({
                latitude: newLocation.lat,
                longitude: newLocation.lng
            })

            setLocationString(formatted_address);
            
            setAddress({
                streetAddress: addressArray[0],
                city: addressArray[1],
                stateZip: addressArray[2],
                regionOrCountry: addressArray[3],
                fullAddress: formatted_address,
            });

        } catch (error) {
            console.log(error);
        }
    }

    // ********************************************************
    // LoadEvents from firebase
    // ********************************************************
    const loadEvents = () => {
        // View events collection from firebase
        let viewEvents = collection(db, "events");
        let eventQuery;

        eventQuery = viewEvents;

        getDocs(eventQuery).then(docs => {
            let events = [];
            docs.forEach((doc) => {
                let docData = doc.data();

                // Only display valid events
                if (new Date() > new Date(docData.endTime.seconds * 1000)) return;
                if (docData.attendees.length >= docData.attendeeLimit) return;
                if (!docData.lat || !docData.lon) return;

                let isAttending = docData.attendees.some((value) => { return value.id === auth.currentUser.uid });

                // Compute event distance from user
                let distance = +((getDistance(
                    { latitude: location.latitude, longitude: location.longitude },
                    { latitude: docData.lat, longitude: docData.lon },
                ) / 1600).toFixed(2));
                
                let event = {
                    id: doc.id,
                    name: docData.name,
                    description: docData.description,
                    startTime: new Date(docData.startTime.seconds * 1000),
                    endTime: new Date(docData.endTime.seconds * 1000),
                    address: docData.address,
                    lat: docData.lat,
                    lon: docData.lon,
                    eventGeo: docData.geoLocation,
                    host: docData.host,
                    hostToken: docData.hostToken,
                    attendeeTokens: docData.attendeeTokens,
                    isAttending: isAttending,
                    distance: distance
                };
                events.push(event);
            });

            // Set events to the loaded events
            setEventsArray(events.sort((a, b) => (a.startTime > b.startTime) ? 1 : -1));
        })
    }

    // Map screen
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <SafeAreaView style={mapStyle.container}>
                <LocationBar
                    initialValue={locationString}
                    setSearchPhrase={setLocationPhrase}
                    onSubmit={handleNewLocation}
                />
                <MapView style={mapStyle.map}
                    // The initial Location is set to user's location or UCSC if not given permission
                    // If came from event details, then go to event location
                    region={
                        eventLocation ?
                        {
                            latitude: eventLocation.lat,
                            longitude: eventLocation.lng,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        } :   
                        {
                            latitude: location.latitude,
                            longitude: location.longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }
                    }
                >
                    { // Display loaded events from firebase
                        eventsArray[0] != null && eventsArray.map((event, index) => (
                            <Marker

                                key={index}
                                coordinate={{
                                    latitude: event.lat,
                                    longitude: event.lon
                                }}
                                pinColor={eventColor}
                                title={event.name}
                            >
                                <Callout>
                                    <View style={mapStyle.calloutContainer}>
                                        <Text style={mapStyle.calloutTitle}>{event.name}</Text>
                                        <View style={mapStyle.calloutBody}>
                                            <Text style={mapStyle.calloutDistance}>{event.distance} mi</Text>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    navigation.navigate("Event Details", { eventID: event.id, host: event.host.id })
                                                }}
                                            >
                                                <Text style={mapStyle.detailText}>View details...</Text>
                                            </TouchableOpacity>
                                            </View>
                                    </View>
                                </Callout>
                            </Marker>
                        ))
                    }

                    {/* User Marker */}
                    <Marker coordinate={location}
                        pinColor={userColor}
                    >
                        <Callout>
                            <View style={mapStyle.calloutContainer}>
                                <Text style={{fontWeight: 'bold'}}>You are here</Text>
                            </View>
                        </Callout>
                    </Marker>
                    <Circle center={location}
                        // Draw a circle around the marked location
                        radius={searchRadius}
                    ></Circle>
                </MapView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

export default MapScreen;
