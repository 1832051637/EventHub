import { Text, SafeAreaView, TextInput, View, TouchableOpacity, Keyboard } from 'react-native';
import React, { useContext, useState } from 'react';
import MapView, { Callout, Circle, Marker } from 'react-native-maps';
import style from '../styles/style';
import mapStyle from '../styles/mapStyle';
import Geocoder from 'react-native-geocoding';

import { MAP_KEY } from '../utils/API_KEYS';
import { UserInfoContext } from '../utils/UserInfoProvider';

const MapScreen = ({ route }) => {
    Geocoder.init("AIzaSyAKuGciNBsh0rJiuXAvza2LKTl5JWyxUbA", { language: "en" });
    let API_KEY = MAP_KEY();

    const { location } = useContext(UserInfoContext);
    const [userLocation, setLocation] = useState(location);
    const [address, setAddress] = React.useState({
        streetAddress: "",
        city: "",
        stateZip: "",
        fullAddress: ""
    });

    const [locationText, setLocationText] = useState("");
    // const [fullAddress, setFullAddress] = React.useState("");

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
    }, [userLocation])

    const searchAddress = () => {
        console.log("Sanity check");
        console.log(address.fullAddress);
    }

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
                <Marker coordinate={userLocation} //Probably should have a special marker for user
                    userLocationColor='red'
                >
                    <Callout>
                        <View style={mapStyle.callOutContainer}>
                            <Text>Some random person is at {address.fullAddress}</Text>
                        </View>
                    </Callout>
                </Marker>

                <Circle center={userLocation}
                    // Draw a circle around the marked location
                    radius={2000}
                ></Circle>
            </MapView>
        </SafeAreaView>
    );
};

export default MapScreen;

// const styles = StyleSheet.create({});
