import { Text, View, TextInput, TouchableOpacity, Image, SafeAreaView, } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { auth, db, storage } from '../firebase'
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Geocoder from 'react-native-geocoding';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Geohash from 'latlon-geohash';
import style from '../styles/style'
import createStyle from '../styles/createStyle';
import uuid from "uuid";
import { UserInfoContext } from '../utils/UserInfoProvider';
import { useNavigation } from '@react-navigation/native';
import LoadingView from '../components/LoadingView';
import { inputValidator, inputValidationAlert } from '../utils/generalUtils';
import VerifyEmailButton from '../components/VerifyEmailButton';
import { GOOGLE_MAPS_API_KEY } from '@env';

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

    // Validates the Date and Modifies End Date if necessary
    const checkDate = (newDate) => {
        if (endDate < newDate) {
            setEndDate(newDate);
        }
    }

    const startDateChange = (event, newDate) => {
        checkDate(newDate);
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

    // Uploads event to the database
    const addEvent = async () => {
        const eventCheck = {
            name: eventName,
            description: eventDescription,
            attendeeLimit: attendeeLimit,
            location: eventLocation,
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
                    alert("Invalid Location. Please enter again!");
                    return;
                }

                setLoading(true);
                
                const location = json.results[0].geometry.location;
                const address = json.results[0].formatted_address;

                // Default image url for event
                let downloadURL = 'https://firebasestorage.googleapis.com/v0/b/event-hub-29d5a.appspot.com/o/IMG_7486.jpg?alt=media&token=34b9f8bc-23a2-42e6-8a77-f0cfdfd33a6a';
                let imageID = '';

                // Upload selected image to firestore
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
                    host: userRef,
                    hostToken: pushToken,
                    attendeeTokens: [],
                    lat: location.lat,
                    lon: location.lng,
                    address: address,
                    imageID: imageID,
                    image: downloadURL
                }

                // Upload event to firebase
                const eventRef = await addDoc(collection(db, "events"), eventData);

                // Add event id to user's hosting and attending arrays
                await updateDoc(userRef, {
                    hosting: arrayUnion(eventRef),
                    attending: arrayUnion(eventRef),
                });

                resetFields();
                setLoading(false);

                // Go to event details page
                navigation.push("Event Details", { eventID: eventRef.id, host: auth.currentUser.uid });
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        }
    }

    // Resets the input fields of the screen
    const resetFields = () => {
        setEventName('');
        setEventDescription('');
        setAttendeeLimit('');
        setEventLocation('');
        setSelectedImage(null);
        setStartDate(new Date());
        setEndDate(new Date());
    }

    // Renders verify email button if user's email is not verified
    if (!auth.currentUser.emailVerified) {
        return (
            <View style={style.container}>
                <Text style={createStyle.verifyText}>Please verify your email address before creating an event.</Text>
                <View style={style.buttonContainer}>
                    <VerifyEmailButton />
                </View>
            </View>
        )
    }

    // Render loading view if in loading state
    if (loading) {
        return (<LoadingView />)
    }

    // Event creation screen
    return (
        <SafeAreaView style={createStyle.container}>
            <KeyboardAwareScrollView
                contentContainerStyle={createStyle.scroll}

                //*********************************************
                // To fix autocomplete list in scrollView error 
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
            <View style={{ height: 80 }}></View>
        </SafeAreaView>
    );
};

export default CreateScreen;
