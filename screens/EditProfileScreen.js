import React, {useState, useEffect } from 'react';
import {View, Text, TouchableOpacity, TextInput, Alert, ImageBackground} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../firebase'
import style from '../styles/style';
import settingsStyle from '../styles/settingsStyle';
import * as ImagePicker from 'expo-image-picker';
import LoadingView from '../components/LoadingView';
import uuid from "uuid";
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useIsFocused } from '@react-navigation/native';
import { profileValidator, inputValidationAlert } from '../utils/generalUtils';

const EditProfileScreen = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [originalImageID, setOriginalImageID] = useState('');
    const [originalImage, setOriginalImage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    // Loads the current profile information
    useEffect(async () => {
        setLoading(true);
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userData = (await getDoc(userRef)).data();

        setFirstName(userData.firstName);
        setLastName(userData.lastName);
        setOriginalImage(userData.profilePicture);
        setOriginalImageID(userData.profilePictureID);
        setLoading(false);
    }, [isFocused])

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

            const fileRef = ref(storage, 'profile-pics/' + id);
            await new Promise(r => setTimeout(r, 1000)); // Hack to keep expo app from crashing on phone
            await uploadBytes(fileRef, blob);
            blob.close();
            return await getDownloadURL(fileRef);
        } catch (error) {
            console.log(error);
        }
    }

    // Opens user's camera to take a picture
    const openCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
        if (permissionResult.granted === false) {
          alert("Please allow camera permissions");
          return;
        }
    
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.5,
        });
    
        if (!result.cancelled) {
            setSelectedImage({ localUri: result.uri });
        }
    }

    // Asks the user to select and image or take a picture
    const selectImage = () => {
        Alert.alert(
            "Profile Picture",
            "Please Upload or Take a Photo",
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Take A Photo',
                    onPress: () => openCamera(),
                },
                {   text: 'Choose From Gallery', 
                    onPress: () => openImagePickerAsync() 
                },
            ]
        )
    };

    // Updates the profile information
    const saveProfile = async () => {
        setLoading(true);

        // Checks if the new profile info is valid
        let validation = profileValidator(firstName, lastName);
        if (!validation.valid) {
            inputValidationAlert(validation.errors);
            return;
        } 

        try {
            let downloadURL = originalImage;
            let imageID = originalImageID;

            // Upload the new image if a new image was selected
            if (selectedImage !== null) {
                imageID = uuid.v4();
                downloadURL = await uploadImageAsync(selectedImage.localUri, imageID);

                // Delet the original image
                if (originalImageID) {
                    let imageRef = ref(storage, 'profile-pics/' + originalImageID);
                    await deleteObject(imageRef);
                }
            }

            const userRef = doc(db, 'users', auth.currentUser.uid);

            // Update the user doc with the new profile info
            await updateDoc(userRef, {
                firstName: firstName,
                lastName: lastName,
                name: firstName + ' ' + lastName,
                profilePictureID: imageID,
                profilePicture: downloadURL,
            });

            setLoading(false);

            // Go back to the profile page
            navigation.pop();
        } catch (error) {
            console.log(error);
            alert(error);
            setLoading(false);
        }
    }

    // Render loading screen if in loading state
    if (loading) {
        return (<LoadingView />);
    }

    // Edit profile screen
    return (
        <View style={settingsStyle.profileContainer}>
            <View>
                <TouchableOpacity
                    onPress={selectImage}
                >
                    {selectedImage &&
                        <ImageBackground
                            source={{ uri: selectedImage.localUri }}
                            style={settingsStyle.profilePicture}
                            imageStyle={{borderRadius: 75}}
                        >
                            <View
                                style={settingsStyle.pictureContainer}>
                                <MaterialCommunityIcons
                                    name="camera"
                                    size={40}
                                    color="#000"
                                    style={settingsStyle.cameraIcon}
                                />
                            </View>
                        </ImageBackground>
                    }
                    {(!selectedImage && originalImage !== '') &&
                        <ImageBackground
                            source={{ uri: originalImage }}
                            style={settingsStyle.profilePicture}
                            imageStyle={{borderRadius: 75}}
                        >
                            <View
                                style={settingsStyle.pictureContainer}>
                                <MaterialCommunityIcons
                                    name="camera"
                                    size={40}
                                    color="#000"
                                    style={settingsStyle.cameraIcon}
                                />
                            </View>
                        </ImageBackground>
                    }
                </TouchableOpacity>
            </View>
            <View style={[style.inputContainer, {marginBottom: 20}]}>
                <TextInput
                    placeholder='First name'
                    value={firstName}
                    onChangeText={text => setFirstName(text)}
                    style={style.input}
                    scrollEnabled={false}
                    minHeight={20}
                />
                <TextInput
                    placeholder='Last name'
                    value={lastName}
                    onChangeText={text => setLastName(text)}
                    style={style.input}
                    scrollEnabled={false}
                    minHeight={20}
                />
            </View>
            <View style={style.buttonContainer}>
                <TouchableOpacity
                    style={style.button}
                    onPress={saveProfile}
                >
                    <Text
                        style={style.buttonText}
                    >Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default EditProfileScreen;
