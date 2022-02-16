import { Text, View, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth, db, storage } from '../firebase'
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geocoder from 'react-native-geocoding';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Geohash from 'latlon-geohash';
import style from '../styles/style'
import createStyle from '../styles/createStyle';
import uuid from "uuid";

const today = new Date();

const CreateScreen = () => {

    // Geocoder.init("AIzaSyAKuGciNBsh0rJiuXAvza2LKTl5JWyxUbA", { language: "en" });
    // Location.setGoogleApiKey('AIzaSyA3wSOhQpvy9yDpb0cZXLidft2dNL-4LQ8');

    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [attendeeLimit, setAttendeeLimit] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [date, setDate] = useState(today);
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [pushToken, setPushToken] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [eventCoord, setEventCoord] = useState("");

    useEffect(() => {
        registerForPushNotificationsAsync();
    }, []);

    const registerForPushNotificationsAsync = async () => {
        console.log("Registering token");
        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            // console.log(token);
            setPushToken(token);
            const userRef = doc(db, 'users', auth.currentUser.uid);
            updateDoc(userRef, {
                hostToken: token
            });
        } else {
            alert('Must use physical device for Push Notifications');
        }

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }
    };

    const openImagePickerAsync = async () => {
        let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
        if (permissionResult.granted === false) {
          alert('Permission to access camera roll is required!');
          return;
        }
    
        let pickerResult = await ImagePicker.launchImageLibraryAsync();
        if (pickerResult.cancelled === true) {
          return;
        }
    
        setSelectedImage({ localUri: pickerResult.uri });
    };

    async function uploadImageAsync(uri) {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                console.log(e);
                reject(new TypeError("Network request failed"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", uri, true);
            xhr.send(null);
        });
      
        const fileRef = ref(storage, 'event-images/' + uuid.v4());
        await uploadBytes(fileRef, blob);
        blob.close();
        return await getDownloadURL(fileRef);
    }
      

    const dateChange = (event, newDate) => {
        setEndTime(newDate);
        setStartTime(newDate);
        setDate(newDate);
    }

    const setDay = (check, newTime) => {
        let day = date.getDate();
        newTime.setDate(day);

        check ? setEndTime(newTime) : setStartTime(newTime);
    }

    const startTimeChange = (event, newTime) => {
        setDay(0, newTime);
    }

    const endTimeChange = (event, newTime) => {
        setDay(1, newTime);
    }

    const addEvent = async () => {
        try {
            // ********************************************************
            // Get the coord of event based on user entered address
            // ********************************************************

            Geocoder.init("AIzaSyAKuGciNBsh0rJiuXAvza2LKTl5JWyxUbA", { language: "en" });
            var location;
            var address;
            await Geocoder.from(eventLocation)
                .then(json => {
                    location = json.results[0].geometry.location;
                    address = json.results[0].formatted_address;
                })
                .catch(error => console.log(error.origin));
            
            let eventRef;
            const userRef = doc(db, 'users', auth.currentUser.uid);

            // Initialize eventdatas
            const eventData = {
                name: eventName,
                description: eventDescription,
                total: attendeeLimit,
                location: eventLocation,
                eventDate: date,
                startTime: startTime,
                endTime: endTime,
                //image: imageURL,
                geoLocation: Geohash.encode(eventCoord.latitude, eventCoord.longitude, [3]),
                attendees: [userRef],
                host: auth.currentUser.uid,
                attendeeTokens: [],
                lat: location.lat,
                lon: location.lng,
                address: address,
            }

            const imageUri = selectedImage.localUri

            // Push to firebase Database
            await addDoc(collection(db, "events"), eventData)
                .then((ref) => {
                    resetFields();
                    eventRef = ref;

                    updateDoc(userRef, {
                        hosting: arrayUnion(eventRef),
                        attending: arrayUnion(eventRef),
                    });
                })
                .then(() => {
                    return uploadImageAsync(imageUri)
                })
                .then((downloadURL) => {
                    return updateDoc(eventRef, {
                        hostToken: pushToken,
                        image: downloadURL
                    });
                })

        } catch (error) {
            console.log(error);
        }
    }

    const resetFields = () => {
        setEventName('');
        setEventDescription('');
        setAttendeeLimit('');
        setEventLocation('');
        setSelectedImage(null);
    }

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    return;
                }

                let userLocation = await Location.getLastKnownPositionAsync();
                // alert(userLocation);
                let userLocations = [];
                let userCoords = userLocation.coords;
                setEventCoord(userCoords);



                userLocations.push({ longitude: JSON.stringify(userCoords.longitude), latitude: JSON.stringify(userCoords.latitude) });
                //alert("User's Location is " + JSON.stringify(location[0]));
                // setEventLocation(JSON.stringify(userLocations[0]))

            }
            catch (error) {
                console.log("error " + error);
            }
        })();
    }, []);

    return (
        <KeyboardAwareScrollView contentContainerStyle={createStyle.container}>
            <View style={createStyle.inputContainer}>
                <View style={createStyle.inputItem}>
                    <TextInput
                        placeholder='Title'
                        value={eventName}
                        onChangeText={text => setEventName(text)}
                        style={createStyle.titleInput}
                        multiline={true}
                        scrollEnabled={false}
                    />
                </View>
                <View style={createStyle.inputItem}>
                    <MaterialCommunityIcons name="text" size={20} style={createStyle.icon} color='rgb(100, 100, 100)' />
                    <TextInput
                        placeholder='Description'
                        value={eventDescription}
                        onChangeText={text => setEventDescription(text)}
                        style={createStyle.input}
                        multiline={true}
                        scrollEnabled={false}
                        minHeight={150}
                    />
                </View>
                <View style={createStyle.dateBox}>
                    <MaterialCommunityIcons name="clock-outline" size={20} color='rgb(100, 100, 100)' />
                    <RNDateTimePicker 
                        display="default"
                        style={createStyle.datePicker} 
                        value={date} 
                        onChange={dateChange}
                    />
                    <Text style={createStyle.datePickerText}>from</Text>
                    <RNDateTimePicker 
                        value={startTime}
                        style={createStyle.datePicker} 
                        display="default" 
                        mode="time" 
                        onChange={startTimeChange} 
                        textColor='white'
                    />
                    <Text style={createStyle.datePickerText}>to</Text>
                    <RNDateTimePicker 
                        value={endTime} 
                        style={createStyle.datePicker} 
                        display="default"
                        mode="time" 
                        onChange={endTimeChange} 
                    />
                </View>
                <View style={createStyle.inputItem}>
                    <MaterialCommunityIcons name="map-marker" size={20} style={createStyle.icon} color='rgb(100, 100, 100)' />
                    <TextInput
                        placeholder='Location'
                        value={eventLocation}
                        onChangeText={text => setEventLocation(text)}
                        style={createStyle.input}
                        multiline={true}
                        scrollEnabled={false}
                    />
                </View>
                <View style={createStyle.inputItem}>
                    <MaterialCommunityIcons name="account-group-outline" size={20} style={createStyle.icon} color='rgb(100, 100, 100)' />   
                    <TextInput
                        placeholder='Attendee Limit'
                        value={attendeeLimit}
                        onChangeText={text => setAttendeeLimit(text)}
                        style={createStyle.input}
                        keyboardType={"number-pad"}
                    />
                </View>
                <View style={createStyle.imageSelect}>
                    <TouchableOpacity
                        onPress={openImagePickerAsync}
                        style={createStyle.imageButton}
                    >
                        <MaterialCommunityIcons name="image-plus" size={20} style={createStyle.icon} color='rgb(100, 100, 100)' />
                        {selectedImage && <Image style={createStyle.image} source={{ uri: selectedImage.localUri }} />}
                    </TouchableOpacity>
                </View>
            </View>
            <View style={style.buttonContainer}>
                <TouchableOpacity
                    style={style.button}
                    onPress={addEvent}
                >
                    <Text
                        style={style.buttonText}
                    >Create Event</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAwareScrollView >
    );
};

export default CreateScreen;
