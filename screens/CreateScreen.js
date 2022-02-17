import { Text, View, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { auth, db, storage } from '../firebase'
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geocoder from 'react-native-geocoding';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Geohash from 'latlon-geohash';
import style from '../styles/style'
import createStyle from '../styles/createStyle';
import uuid from "uuid";
import { UserInfoContext } from '../utils/UserInfoProvider';

const CreateScreen = () => {
    const { pushToken } = useContext(UserInfoContext);
    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [attendeeLimit, setAttendeeLimit] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    //const [pushToken, setPushToken] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        startTimeChange(null, startTime);
        endTimeChange(null, endTime);
    }, [date]);

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
        try {
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
            await new Promise(r => setTimeout(r, 1000)); // Hack to keep expo app from crashing on phone
            await uploadBytes(fileRef, blob);
            blob.close();
            return await getDownloadURL(fileRef);
        } catch (error) {
            console.log(error);
        }
    }
      

    const dateChange = (event, newDate) => {
        setDate(newDate);
    }

    const startTimeChange = (event, newTime) => {
        newTime.setFullYear(date.getFullYear());
        newTime.setMonth(date.getMonth());
        newTime.setDate(date.getDate());

        setStartTime(newTime);
    }

    const endTimeChange = (event, newTime) => {
        newTime.setFullYear(date.getFullYear());
        newTime.setMonth(date.getMonth());
        newTime.setDate(date.getDate());

        setEndTime(newTime);
    }

    const addEvent = async () => {
        try {
            // ********************************************************
            // Get the coord of event based on user entered address
            // ********************************************************

            Geocoder.init("AIzaSyAKuGciNBsh0rJiuXAvza2LKTl5JWyxUbA", { language: "en" });
            const json = await Geocoder.from(eventLocation);
            const location = json.results[0].geometry.location;
            const address = json.results[0].formatted_address;

            let downloadURL = 'gs://event-hub-29d5a.appspot.com/IMG_7486.jpg';

            if (selectedImage !== null) {
                downloadURL = await uploadImageAsync(selectedImage.localUri);
            }
            
            const userRef = doc(db, 'users', auth.currentUser.uid);

            // Initialize eventdatas
            const eventData = {
                name: eventName,
                description: eventDescription,
                attendeeLimit: attendeeLimit,
                location: eventLocation,
                startTime: startTime,
                endTime: endTime,
                geoLocation: Geohash.encode(location.lat, location.lng, [3]),
                attendees: [userRef],
                host: auth.currentUser.uid,
                hostToken: pushToken,
                attendeeTokens: [],
                lat: location.lat,
                lon: location.lng,
                address: address,
                image: downloadURL
            }
            
            // Push to firebase Database
            const eventRef = await addDoc(collection(db, "events"), eventData);

            await updateDoc(userRef, {
                hosting: arrayUnion(eventRef),
                attending: arrayUnion(eventRef),
            });

            resetFields();

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
