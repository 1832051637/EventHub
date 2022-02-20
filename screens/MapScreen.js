import { Text, SafeAreaView, TextInput, View, TouchableOpacity, Keyboard } from 'react-native';
import React, { useContext, useState } from 'react';
import MapView, { Callout, Circle, Marker } from 'react-native-maps';
import style from '../styles/style';
import mapStyle from '../styles/mapStyle';
import Geocoder from 'react-native-geocoding';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, storage, auth } from '../firebase';
import { ref } from 'firebase/storage';
import { MAP_KEY } from '../utils/API_KEYS';
import { UserInfoContext } from '../utils/UserInfoProvider';

const MapScreen = ({ route }) => {
    Geocoder.init("AIzaSyAKuGciNBsh0rJiuXAvza2LKTl5JWyxUbA", { language: "en" });
    let API_KEY = MAP_KEY();

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

    const searchInitial = () => {
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
            // console.log(result);
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
            // setFullAddress(addressResult);
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
                };
                events.push(event);
            });
            setEventsArray(events.sort((a, b) => (a.startTime > b.startTime) ? 1 : -1));

        })
    }


    return (
        <SafeAreaView style={mapStyle.container}>
            <View style={mapStyle.searchContainer}>
                <TextInput
                    placeholder='Enter a new location...'
                    value={locationText}
                    onChangeText={text => setLocationText(text)}
                    style={mapStyle.input}
                ></TextInput>
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
                    eventsArray[0] != null && eventsArray.map((marker, index) => (
                        <Marker

                            key={index}
                            coordinate={{
                                latitude: marker.lat,
                                longitude: marker.lon
                            }}
                            pinColor={eventColor}
                            title={marker.name}
                        >
                            <Callout>
                                <View style={mapStyle.callOutContainer}>
                                    <Text>{marker.name}</Text>
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
