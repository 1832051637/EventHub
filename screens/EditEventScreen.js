import { Text, View, TextInput, TouchableOpacity, Image, Button, SafeAreaView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth, db, storage } from '../firebase'
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geocoder from 'react-native-geocoding';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Geohash from 'latlon-geohash';
import createStyle from '../styles/createStyle';
import uuid from "uuid";
import { useNavigation } from '@react-navigation/native';
import LoadingView from '../components/LoadingView';
import { deleteAlert, inputValidator, inputValidationAlert } from '../utils/generalUtils';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_API_KEY } from '@env';

const EditEventScreen = ( {route, navigation} ) => {
    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [attendeeLimit, setAttendeeLimit] = useState('');
    const [attendeeTokens, setAttendeeTokens] = useState([]);
    const [eventLocation, setEventLocation] = useState('');
    const [host, setHost] = useState(null);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date());
    const [selectedImage, setSelectedImage] = useState(null);
    const [changedImage, setChangedImage] = useState(false);
    const [changedOriginalImage, setChangedOriginalImage] = useState(false);
    const [originalImage, setOriginalImage] = useState(null);
    const [originalImageID, setOriginalImageID] = useState(null);
    const [loading, setLoading] = useState(false);
    const [update, setUpdate] = useState(false);
    const [eventDeleted, setEventDeleted] = useState(false);
    const {setOptions} = useNavigation();
    const eventID = route.params.eventID;

    // Fills edit form in with event info from database
    useEffect(async () => {
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
            setStartDate(start);
            setEndDate(end);
            setOriginalImage(docData.image);
            setOriginalImageID(docData.imageID);

            // Render save button if user is the event host
            if (auth.currentUser.uid === docData.host.id) {
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
    }, [startDate]);

    useEffect(() => {
        endTimeChange(null, endTime);
    }, [endDate]);

    // Navigate back if the event is deleted
    useEffect(() => {
        if (eventDeleted) {
            navigation.popToTop();
        }
    }, [eventDeleted])

    // Updates the event
    useEffect(async () => {
        if (update === true) {
            setUpdate(false);

            const eventCheck = {
                name: eventName,
                description: eventDescription,
                attendeeLimit: attendeeLimit,
                location: eventLocation,
                numCurrentAttendees: attendeeTokens.length,
                startTime: startTime,
                endTime: endTime
            }

            // Checks that the event fields are valid
            let validation = inputValidator(eventCheck);
            if (!validation.valid) {
                inputValidationAlert(validation.errors)
                
            } else {
                try {
                    // Get the location information from the inputted address
                    let json;
                    try {
                        Geocoder.init(`${GOOGLE_MAPS_API_KEY}`, { language: "en" });
                        json = await Geocoder.from(eventLocation);
    
                    } catch (error) {
                        console.log(error);
                        alert("Invalid Location. Please enter again!");
                        return;
                    }
    
                    setLoading(true);
                    
                    const location = json.results[0].geometry.location;
                    const address = json.results[0].formatted_address;

                    
                    const userRef = doc(db, 'users', auth.currentUser.uid);

                    // Initialize event data
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

                    // Upload the new image to firestore if it was changed
                    if (changedImage) {
                        let downloadURL;
                        const imageID = uuid.v4();

                        if (selectedImage !== null) {
                            downloadURL = await uploadImageAsync(selectedImage.localUri, imageID);
                        }
                        
                        eventData.imageID = imageID;
                        eventData.image = downloadURL;
                    }

                    // Deletes the original image
                    if (changedOriginalImage && originalImageID) {
                        let imageRef = ref(storage, 'event-images/' + originalImageID);
                        await deleteObject(imageRef);
                    }

                    // Update the event with the new data
                    const eventRef = doc(db, 'events', route.params.eventID);
                    await updateDoc(eventRef, eventData);

                    // Goes to refreshed details page
                    navigation.pop(2);
                    navigation.push("Event Details", {eventID: route.params.eventID, host: host.id})

                } catch (error) {
                    console.log(error);
                }
                setLoading(false);
            }
        }
    }, [update])

    // Sets the selected image to an image from the user's library
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

    // Uploads an event image to firestore with id as the file name
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

    // Render loading view if in loading state
    if (loading) {
        return (<LoadingView />)
    }

    // Edit event screen
    return (
        <SafeAreaView style={createStyle.container}>
            <KeyboardAwareScrollView 
                contentContainerStyle={createStyle.scroll} 
                keyboardShouldPersistTaps="always"
            >
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
                        {/* Google Autocomplete API 
                        To reduce number of requests, please comment key out to use original textinput
                        */}
                        <GooglePlacesAutocomplete
                            fetchDetails={false}                // We don't need details
                            debounce={1500}                     // Search debounce
                            minLength={3}                       // Minimum number of chars to start a search 
                            query={{
                                //key: `${GOOGLE_MAPS_API_KEY}`,  // *** Comment this line out if you dont use Autocomplete***
                                language: 'en',
                            }}
                            onPress={(data, details) => {
                                setEventLocation(data.structured_formatting.main_text);
                            }}
                            textInputProps={{
                                InputComp: TextInput,
                                leftIcon: { type: 'font-awesome', name: 'chevron-left' },
                                errorStyle: { color: 'red' },
                                placeholder: 'Location',
                                value: eventLocation,
                                onChangeText: text => {
                                    setEventLocation(text);
                                },
                                style: createStyle.input,
                                multiline: true,
                                scrollEnabled: false,
                            }}
                            disableScroll={true}
                            listViewDisplayed={false}
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
                <TouchableOpacity
                    onPress={() => { deleteAlert(eventID, eventName, attendeeTokens, setEventDeleted) }}
                    style={createStyle.deleteButton}
                >
                    <MaterialCommunityIcons name="delete" size={20} color='rgb(200, 0, 0)' />
                    <Text style={createStyle.deleteButtonText}> Delete Event</Text>
                </TouchableOpacity>
            </KeyboardAwareScrollView >
        </SafeAreaView>
    );
};

export default EditEventScreen;
