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
import { useNavigation } from '@react-navigation/native';
import LoadingView from '../components/LoadingView';

const CreateScreen = () => {
    const { pushToken } = useContext(UserInfoContext);
    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [attendeeLimit, setAttendeeLimit] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        startTimeChange(null, startTime);
    }, [startDate]);

    useEffect(() => {
        endTimeChange(null, endTime);
    }, [endDate]);

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

    async function uploadImageAsync(uri, id) {
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

            const fileRef = ref(storage, 'event-images/' + id);
            await new Promise(r => setTimeout(r, 1000)); // Hack to keep expo app from crashing on phone
            await uploadBytes(fileRef, blob);
            blob.close();
            return await getDownloadURL(fileRef);
        } catch (error) {
            console.log(error);
        }
    }


    const startDateChange = (event, newDate) => {
        setStartDate(newDate);
    }

    const endDateChange = (event, newDate) => {
        setEndDate(newDate);
    }

    const startTimeChange = (event, newTime) => {
        newTime.setFullYear(startDate.getFullYear());
        newTime.setMonth(startDate.getMonth());
        newTime.setDate(startDate.getDate());

        setStartTime(newTime);
    }

    const endTimeChange = (event, newTime) => {
        newTime.setFullYear(endDate.getFullYear());
        newTime.setMonth(endDate.getMonth());
        newTime.setDate(endDate.getDate());

        setEndTime(newTime);
    }

    const addEvent = async () => {
        setLoading(true);
        try {

            // ********************************************************
            // Get the coord of event based on user entered address
            // ********************************************************
            Geocoder.init("AIzaSyAKuGciNBsh0rJiuXAvza2LKTl5JWyxUbA", { language: "en" });
            const json = await Geocoder.from(eventLocation);
            const location = json.results[0].geometry.location;
            const address = json.results[0].formatted_address;

            let downloadURL = 'https://firebasestorage.googleapis.com/v0/b/event-hub-29d5a.appspot.com/o/IMG_7486.jpg?alt=media&token=34b9f8bc-23a2-42e6-8a77-f0cfdfd33a6a';
            let imageID = '';

            if (selectedImage !== null) {
                imageID = uuid.v4();
                downloadURL = await uploadImageAsync(selectedImage.localUri, imageID);
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
                imageID: imageID,
                image: downloadURL
            }

            // Push to firebase Database
            const eventRef = await addDoc(collection(db, "events"), eventData);

            await updateDoc(userRef, {
                hosting: arrayUnion(eventRef),
                attending: arrayUnion(eventRef),
            });

            resetFields();
            navigation.push("Event Details", { eventID: eventRef.id, host: auth.currentUser.uid });

        } catch (error) {
            console.log(error);
        }
        setLoading(false);
    }

    const resetFields = () => {
        setEventName('');
        setEventDescription('');
        setAttendeeLimit('');
        setEventLocation('');
        setSelectedImage(null);
    }

    if (loading) {
        return (<LoadingView />)
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
                    <Text style={createStyle.datePickerText}> From</Text>
                    <RNDateTimePicker
                        display="default"
                        style={createStyle.datePicker}
                        minimumDate={new Date()}
                        value={startDate}
                        onChange={startDateChange}
                    />
                    <Text style={createStyle.datePickerText}> at </Text>
                    <RNDateTimePicker
                        value={startTime}
                        style={createStyle.datePicker}
                        display="default"
                        mode="time"
                        onChange={startTimeChange}
                        textColor='white'
                    />
                </View>
                <View style={createStyle.dateBox}>
                    <MaterialCommunityIcons name="clock-outline" size={20} color='rgb(100, 100, 100)' />
                    <Text style={createStyle.datePickerText}> To    </Text>
                    <RNDateTimePicker
                        display="default"
                        style={createStyle.datePicker}
                        minimumDate={startDate}
                        value={endDate}
                        onChange={endDateChange}
                    />
                    <Text style={createStyle.datePickerText}> at </Text>
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
