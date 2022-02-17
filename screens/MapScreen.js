import { Text, SafeAreaView, } from 'react-native';
import React, { useContext, useState } from 'react';
import MapView, { Callout, Circle, Marker } from 'react-native-maps';
import style from '../styles/style';
import mapStyle from '../styles/mapStyle';
import { MAP_KEY } from '../utils/API_KEYS';
import { UserInfoContext } from '../utils/UserInfoProvider';

const MapScreen = ({ route }) => {
    let API_KEY = MAP_KEY();

    const { location } = useContext(UserInfoContext);
    const [currLocation, setCurrLocation] = useState(location);
    const [address, setAddress] = React.useState({
        streetAddress: "",
        city: "",
        stateZip: "",
        // fullAddress: ""
    });
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
        <SafeAreaView style={style.container}>
            <MapView style={mapStyle.map}
                // The initial Location is set to user's location or UCSC if not given permission
                region={{
                    latitude: currLocation.latitude,
                    longitude: currLocation.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                <Marker coordinate={location} //Probably should have a special marker for user
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
                        <Text style={style.container}>
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
