import { Text, View } from 'react-native';
import React from 'react';
import MapView, { Callout, Circle, Marker } from 'react-native-maps';
import styles from '../styles/styles.js';


const MapScreen = () => {
    const [currLocation, setCurrLocation] = React.useState({
        latitude: 36.9881,
        longitude: -122.0582,
    })

    return (
        <View style={styles.container}>
            <Text>This is the map screen. The pin location on the map is hardcoded, you can press and hold, then drag it around.</Text>
            <MapView style={styles.map}
                // The initial Location is hard-coded to
                // University of California Santa Cruz
                initialRegion={{
                    latitude: 36.9881,
                    longitude: -122.0582,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                <Marker coordinate={currLocation}
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
                            This is a hardcoded initial location!
                        </Text>
                    </Callout>
                </Marker>

                <Circle center={currLocation}
                    // Draw a circle around the marked location
                    radius={2000}
                ></Circle>

            </MapView>
        </View >
    );
};

export default MapScreen;

// const styles = StyleSheet.create({});
