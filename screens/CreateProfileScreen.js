import React, {useState, useEffect, useContext} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Alert,
    ImageBackground
} from 'react-native';

import { collection, doc, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db, storage } from '../firebase'
import style from '../styles/style';
import * as ImagePicker from 'expo-image-picker';
import LoadingView from '../components/LoadingView';
import uuid from "uuid";
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { profileValidator, inputValidationAlert } from '../utils/eventUtils';

const CreateProfileScreen = () => {

    const [username, setUsername] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

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

            const fileRef = ref(storage, 'profile-pics/' + id);
            await new Promise(r => setTimeout(r, 1000)); // Hack to keep expo app from crashing on phone
            await uploadBytes(fileRef, blob);
            blob.close();
            return await getDownloadURL(fileRef);
        } catch (error) {
            console.log(error);
        }
    }

    const openCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
        if (permissionResult.granted === false) {
          alert("Please allow camera permissions");
          return;
        }
    
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
        });
    
        if (!result.cancelled) {
            setSelectedImage({ localUri: result.uri });
        }
    }

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

    const resetFields = () => {
        setUsername('');
        setSelectedImage(null);
    }

    const addProfile = async () => {
        let validation = profileValidator(username);
        const q = query(collection(db, "users"), where("username", "==", username));
        const querySnapshot = await getDocs(q);
        if(!querySnapshot.empty) {
            validation.valid = false;
            validation.errors = "- Username taken, try another one."
        }
        if (!validation.valid) {
            inputValidationAlert(validation.errors)
        } else {
            setLoading(true);
            try {
                let downloadURL = 'https://firebasestorage.googleapis.com/v0/b/event-hub-29d5a.appspot.com/o/defaultProfilePicture.jpg?alt=media&token=acb8706e-8b4a-401d-a29a-85a85add1f53';
                let imageID = '';

                if (selectedImage !== null) {
                    imageID = uuid.v4();
                    downloadURL = await uploadImageAsync(selectedImage.localUri, imageID);
                }

                const userRef = doc(db, 'users', auth.currentUser.uid);

                await updateDoc(userRef, {
                    profilePictureID: imageID,
                    profilePicture: downloadURL,
                    username: username
                });

                resetFields();
                navigation.pop(1);
            } catch (error) {
                console.log(error);
                alert(error);
            }
            setLoading(false);
        }
    }

    return (
        <View style={style.profileContainer}>
            <View style={style.imageSelect}>
                <TouchableOpacity
                    onPress={selectImage}
                >
                    {selectedImage 
                    ? 
                        <ImageBackground
                            source={{ uri: selectedImage.localUri }}
                            style={{height: 150, width: 150}}
                            imageStyle={{borderRadius: 75}}>
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <MaterialCommunityIcons
                                    name="camera"
                                    size={40}
                                    color="#000"
                                    style={{
                                        opacity: 0.5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 2,
                                        borderColor: '#000',
                                        borderRadius: 10,
                                    }}
                                />
                            </View>
                        </ImageBackground>
                    : 
                        <ImageBackground
                            source={require('../assets/defaultProfilePicture.jpg')}
                            style={{height: 150, width: 150}}
                            imageStyle={{borderRadius: 75}}>
                            <View
                                style={{
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <MaterialCommunityIcons
                                    name="camera"
                                    size={40}
                                    color="#000"
                                    style={{
                                        opacity: 0.5,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 2,
                                        borderColor: '#000',
                                        borderRadius: 10,
                                    }}
                                />
                            </View>
                        </ImageBackground>
                    }
                </TouchableOpacity>
            </View>
            <View style={style.profileUsernameInput}>
                <TextInput
                    placeholder='Username'
                    value={username}
                    onChangeText={text => setUsername(text)}
                    style={style.input}
                    scrollEnabled={false}
                    minHeight={20}
                />
            </View>
            <View style={style.buttonContainer}>
                <TouchableOpacity
                    style={style.button}
                    onPress={addProfile}
                >
                    <Text
                        style={style.buttonText}
                    >Create Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default CreateProfileScreen;
