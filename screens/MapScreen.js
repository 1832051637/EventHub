import { Text, SafeAreaView, TextInput, View, TouchableOpacity, Keyboard } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import MapView, { Callout, Circle, Marker } from 'react-native-maps';
import mapStyle from '../styles/mapStyle';
import Geocoder from 'react-native-geocoding';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, storage, auth } from '../firebase';
import { ref } from 'firebase/storage';
import { MAP_KEY, PLACES_API, GEOCODING_API } from '../utils/API_KEYS';
import { UserInfoContext } from '../utils/UserInfoProvider';
import { getDistance } from 'geolib';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';




const MapScreen = ({ route }) => {
    const GOOGLE_PLACES_API_KEY = PLACES_API();
    const GOOGLE_GEOCODING_API_KEY = GEOCODING_API();
    const API_KEY = MAP_KEY();


    const navigation = useNavigation();
    const { location } = useContext(UserInfoContext);
    // const { myGeo, pushToken } = useContext(UserInfoContext);
    const [userLocation, setLocation] = useState(location);
    const [address, setAddress] = React.useState({
        streetAddress: "",
        city: "",
        stateZip: "",
        fullAddress: ""
    });
    const [locationText, setLocationText] = useState("");
    const [eventsArray, setEventsArray] = useState([]);
    const [searchRadius, setRadius] = useState(2000);
    const userColor = 'red';
    const eventColor = '#ffe01a';

    useEffect(async () => {
        setLocation(location);
    }, [location]);

    const searchInitial = () => {
        console.log("User Location Latitude is " + userLocation.latitude);
        let gc_start = "https://api.mapbox.com/geocoding/v5/mapbox.places/";
        let gc_end = ".json?country=US&access_token=";
        let geocoding_request = gc_start.concat(userLocation.longitude, ',', userLocation.latitude, gc_end, API_KEY);

        fetch(geocoding_request).then(function (response) {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(response);
            }
        }).then(function (result) {
            let addressResult = result.features[0].place_name;
            console.log("Is this your address? " + addressResult);
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

    React.useEffect(() => {
        searchInitial();
        loadEvents();
    }, [userLocation])


    // ********************************************************
    // Reset the marker based on user entered location
    // ********************************************************
    const handleNewLocation = async () => {
        Geocoder.init(GOOGLE_GEOCODING_API_KEY, { language: "en" });
        Keyboard.dismiss();
        try {
            const json = await Geocoder.from(locationText)
                .catch(() => {
                    alert("Invalid Location. Please enter again!");
                    return;
                });
            const newLocation = json.results[0].geometry.location;
            const formatted_address = json.results[0].formatted_address;
            // alert(formatted_address);
            const addressArray = formatted_address.split(", ");
            setLocation({
                latitude: newLocation.lat,
                longitude: newLocation.lng
            })
            // alert(userLocation)
            setAddress({
                streetAddress: addressArray[0],
                city: addressArray[1],
                stateZip: addressArray[2],
                regionOrCountry: addressArray[3],
                fullAddress: addressResult,
            });
            // alert(address.fullAddress);
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

        // if (myGeo) {
        //     eventQuery = query(viewEvents, where("geoLocation", "==", myGeo));
        // }
        getDocs(eventQuery).then(docs => {
            let events = [];
            docs.forEach((doc) => {
                let docData = doc.data();

                // Only display valid events
                if (new Date() > new Date(docData.endTime.seconds * 1000)) return;
                if (docData.attendees.length >= docData.attendeeLimit) return;
                if (!docData.lat || !docData.lon) return;

                // const gsReference = ref(storage, docData.image);
                let isAttending = docData.attendees.some((value) => { return value.id === auth.currentUser.uid });
                let distance = +((getDistance(
                    { latitude: userLocation.latitude, longitude: userLocation.longitude },
                    { latitude: docData.lat, longitude: docData.lon },
                ) / 1600).toFixed(2));
                let event = {
                    id: doc.id,
                    // image: docData.image,
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
            setEventsArray(events.sort((a, b) => (a.startTime > b.startTime) ? 1 : -1));

        })
    }


    return (
        <SafeAreaView style={mapStyle.container}>
            <View style={mapStyle.searchContainer}>
                {/* Google Autocomplete API 
                 To reduce number of requests, please comment key out to use original textinput
                */}
                <GooglePlacesAutocomplete
                    fetchDetails={false}                // We don't need details
                    debounce={1500}                     // Search debounce
                    minLength={3}                       // Minimum number of chars to start a search 
                    query={{
                        // key: GOOGLE_PLACES_API_KEY,  // *** Comment this line out if you dont use Autocomplete***
                        language: 'en',
                    }}
                    onPress={(data, details) => {
                        setLocationText(data.structured_formatting.main_text);
                    }}
                    textInputProps={{
                        InputComp: TextInput,
                        leftIcon: { type: 'font-awesome', name: 'chevron-left' },
                        errorStyle: { color: 'red' },
                        placeholder: 'Enter a new location...',
                        value: locationText,
                        onChangeText: text => {
                            setLocationText(text);
                        },
                        style: mapStyle.input,
                    }}
                />


                <TouchableOpacity
                    onPress={handleNewLocation}
                    style={[mapStyle.button]}
                >
                    <Text style={mapStyle.buttonText}>Go!</Text>
                </TouchableOpacity>
            </View>

            <MapView style={mapStyle.map}
                // The initial Location is set to user's location or UCSC if not given permission
                region={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
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
                                <View style={mapStyle.callOutContainer}>
                                    <Text>{event.name}</Text>
                                    <Text>Distance: {event.distance} miles</Text>
                                    <TouchableOpacity
                                        onPress={() => {
                                            navigation.navigate("Event Details", { eventID: event.id, host: event.host.id })
                                        }}
                                    >
                                        <Text style={mapStyle.detailText}>View Details...</Text>
                                    </TouchableOpacity>
                                </View>
                            </Callout>
                        </Marker>
                    ))
                }

                {/* User Marker */}
                <Marker coordinate={userLocation}
                    pinColor={userColor}
                >
                    <Callout>
                        <View style={mapStyle.callOutContainer}>
                            <Text>You are here: {address.fullAddress}</Text>
                        </View>
                    </Callout>
                </Marker>
                <Circle center={userLocation}
                    // Draw a circle around the marked location
                    radius={searchRadius}
                ></Circle>

            </MapView>
        </SafeAreaView>
    );
};

export default MapScreen;

// const styles = StyleSheet.create({});
