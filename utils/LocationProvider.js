import React, { useState, useEffect, createContext } from 'react';
import * as Location from 'expo-location';
import Geohash from 'latlon-geohash';

export const LocationContext = createContext({});

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState([]);
    const [myGeo, setMyGeo] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                let userLocations = [];
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setLocation({ longitude: -122.0582, latitude: 36.9881 }); // Set to UCSC as default
                } else {
                    let userLocation = await Location.getLastKnownPositionAsync();
                    let userCoords = userLocation.coords;
                    userLocations.push({ longitude: userCoords.longitude, latitude: userCoords.latitude });
                    setLocation(userLocations[0]);
                    let geoLoc = Geohash.encode(userCoords.latitude, userCoords.longitude, [3]);
                    setMyGeo(geoLoc);
                }
            }
            catch (error) {
                console.log("error " + error);
            }
        })();
    }, []);

    return (
        <LocationContext.Provider value={{location, setLocation, myGeo, setMyGeo }}>
            {children}
        </LocationContext.Provider>
    );
};
