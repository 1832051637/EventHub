import { Text, View, TextInput, TouchableOpacity, Alert, Image, Button } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { auth, db, storage } from '../firebase'
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geocoder from 'react-native-geocoding';
import { collection, addDoc, doc, getDoc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Geohash from 'latlon-geohash';
import style from '../styles/style'
import createStyle from '../styles/createStyle';
import uuid from "uuid";
import { UserInfoContext } from '../utils/UserInfoProvider';
import { useNavigation } from '@react-navigation/native';
import LoadingView from '../components/LoadingView';
import { sendUpdateNotifications } from '../utils/eventUtils';

const EditEventScreen = ( {route, navigation} ) => {
    const { pushToken } = useContext(UserInfoContext);
    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [attendeeLimit, setAttendeeLimit] = useState('');
    const [attendeeTokens, setAttendeeTokens] = useState([]);
    const [eventLocation, setEventLocation] = useState('');
    const [host, setHost] = useState('');
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [selectedImage, setSelectedImage] = useState(null);
    const [changedImage, setChangedImage] = useState(false);
    const [changedOriginalImage, setChangedOriginalImage] = useState(false);
    const [originalImage, setOriginalImage] = useState(null);
    const [originalImageID, setOriginalImageID] = useState(null);
    const [loading, setLoading] = useState(false);
    const [update, setUpdate] = useState(false);
    const {setOptions} = useNavigation();

    useEffect(async () => {
        const eventID = route.params.eventID;
        console.log("Event: " + eventID);
        try {
            const eventRef = doc(db, 'events', eventID);
            const docData = (await getDoc(eventRef)).data();
            setEventName(docData.name);
            setEventDescription(docData.description);
            setAttendeeLimit(docData.attendeeLimit);
            setEventLocation(docData.location);
            setHost(docData.host);
            setAttendeeTokens(docData.attendeeTokens);
            const start = docData.startTime.toDate();
            const end = docData.endTime.toDate();
            setStartTime(start);
            setEndTime(end);
            setDate(start);
            setOriginalImage(docData.image);
            setOriginalImageID(docData.imageID);
            if (auth.currentUser.uid === docData.host) {
                setOptions({
                    headerRight: () => {
                        return (
                            <Button onPress={() => setUpdate(true)} title="Save" color="#0782F8" />
                        );
                    }
                });
            }
        } catch(e) {
            console.error(e);
        }
    }, []);
 
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
        setChangedImage(true);
        setChangedOriginalImage(true);
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

    //Updates the event
    useEffect(async () => {
        if (update === true) {
            setUpdate(false);
            setLoading(true);
            try {
                // ********************************************************
                // Get the coord of event based on user entered address
                // ********************************************************
                

                Geocoder.init("AIzaSyAKuGciNBsh0rJiuXAvza2LKTl5JWyxUbA", { language: "en" });
                const json = await Geocoder.from(eventLocation);
                const location = json.results[0].geometry.location;
                const address = json.results[0].formatted_address;

                
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
                    
                    lat: location.lat,
                    lon: location.lng,
                    address: address,
                }

                let downloadURL = 'gs://event-hub-29d5a.appspot.com/IMG_7486.jpg';
                if (changedImage) {
                    const imageID = uuid.v4();

                    if (selectedImage !== null) {
                        downloadURL = await uploadImageAsync(selectedImage.localUri, imageID);
                    }
                    
                    eventData.imageID = imageID;
                    eventData.image = downloadURL;
                }
                //Deletes the original image
                if (changedOriginalImage) {
                    console.log("Deleting original image");
                    let imageRef = ref(storage, 'event-images/' + originalImageID);
                    await deleteObject(imageRef);
                }
                
                const eventRef = doc(db, 'events', route.params.eventID);
                await updateDoc(eventRef, eventData);
                // Comment the below out if you don't want others to get notifications of changes
                await sendUpdateNotifications(attendeeTokens, eventName);
                // Goes to refreshed details page
                navigation.pop(2);
                navigation.push("Event Details", {eventID: route.params.eventID, host: host})
                console.log("Event has been updated!");

            } catch (error) {
                console.log("Obama");
                console.log(error);
            }
            setLoading(false);
        }
    }, [update])   

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
                        {selectedImage 
                            ? <Image style={createStyle.image} source={{ uri: selectedImage.localUri }} />
                            : <Image style={createStyle.image} source={{ uri: originalImage}} />
                        }
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAwareScrollView >
    );
};

export default EditEventScreen;