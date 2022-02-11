import { Text, View, TextInput, Button, TouchableHighlight, SafeAreaView, } from 'react-native';
import React from 'react';
import MapView, { Callout, Circle, Marker } from 'react-native-maps';
import styles from '../styles/styles.js';
import { MAP_KEY } from '../utils/API_KEYS';
import * as Location from 'expo-location';

const MapScreen = ({ route }) => {
    let API_KEY = MAP_KEY();

    const [currLocation, setCurrLocation] = React.useState({
        longitude: -122.0582,
        latitude: 36.9881
    });
    const [address, setAddress] = React.useState({
        streetAddress: "",
        city: "",
        stateZip: "",
        // fullAddress: ""
    });

    React.useEffect(async () => {
        await (async () => {
            try {
                let userLocations = [];
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setCurrLocation({ longitude: -122.0582, latitude: 36.9881 }); // Set to UCSC as default
                } else {
                    let userLocation = await Location.getLastKnownPositionAsync();
                    let userCoords = userLocation.coords;
                    userLocations.push({ longitude: userCoords.longitude, latitude: userCoords.latitude });
                    setCurrLocation(userLocations[0]);
                }

            }
            catch (error) {
                console.log("error " + error);
            }
        })();
    }, []);

    const [fullAddress, setFullAddress] = React.useState("");

    const searchInitial = () => {
        let gc_start = "https://api.mapbox.com/geocoding/v5/mapbox.places/";
        let gc_end = ".json?country=US&access_token=";
        let geocoding_request = gc_start.concat(currLocation.longitude, ',', currLocation.latitude, gc_end, API_KEY);
        
        fetch(geocoding_request).then( function (response) {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(response);
            }
        }).then( function (result) {
            // console.log(result);
            let addressResult = result.features[0].place_name;
            console.log("Is this your address? " + addressResult);
            const addressArray = addressResult.split(", ");
            setAddress({
                streetAddress: addressArray[0],
                city: addressArray[1],
                stateZip: addressArray[2],
            });
            setFullAddress(addressResult);
        }).catch( function (error) {
            console.warn(error);
        });
    }

    React.useEffect(() => {
        searchInitial();
    }, [currLocation])

    const searchAddress = () => {
        console.log("Sanity check");
        console.log(address.fullAddress);
    }

    return (
        <SafeAreaView style={styles.container}>
            <MapView style={styles.map}
                // The initial Location is set to user's location or UCSC if not given permission
                region={{
                    latitude: currLocation.latitude,
                    longitude: currLocation.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                <Marker coordinate={currLocation} //Probably should have a special marker for user
                    currLocationColor='red'
                    draggable={true}
                    onDragStart={(e) => {
                        console.log("Drag starts!", e.nativeEvent.coordinate)
                    }}
                    onDragEnd={(e) => {
                        setCurrLocation({
                            latitude: e.nativeEvent.coordinate.latitude,
                            longitude: e.nativeEvent.coordinate.longitude,
                        })
                    }}
                >
                    <Callout>
                        <Text style={styles.container}>
                            Some random person lives at
                        </Text>
                        <Text> {address.streetAddress} </Text>
                        <Text> {address.city} </Text>
                        <Text> {address.stateZip} </Text>
                    </Callout>
                </Marker>

                <Circle center={currLocation}
                    // Draw a circle around the marked location
                    radius={2000}
                ></Circle>
            </MapView>
        </SafeAreaView>
    );
};

export default MapScreen;

// const styles = StyleSheet.create({});
