import { Text, TouchableOpacity, Image, View, Alert, StyleSheet } from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import style from '../styles/style.js';
import { sendEmailVerification } from "firebase/auth";
import { doc, getDoc} from 'firebase/firestore';
import { auth, db, storage } from '../firebase'
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';

const VerifyEmailButton = () => {
    const handleVerifyEmail = () => {
        sendEmailVerification(auth.currentUser)
        .then(() => {
            Alert.alert("An email to verify your account has been sent!");
        })
        .catch(error => alert(error.message));
    }

    if (auth.currentUser.emailVerified) {
      return null;
    }
  
    return (
        <TouchableOpacity
            onPress={handleVerifyEmail}
            style={style.button}
        >
            <Text style={style.buttonText}>Verify Email Address</Text>
        </TouchableOpacity>
    );
}

const SettingsScreen = () => {
    const [username, setUsername] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);
    const [profileSet, setProfile] = useState(false);
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    useEffect(async () => {
        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            const docData = (await getDoc(userRef)).data();
            setUsername(docData.username);
            setProfilePicture(docData.profilePicture);
            if (username && profilePicture) {
                setProfile(true);
            }
        } catch(e) {
            console.error(e);
        }
    }, [isFocused]);

    return (
        <View style={style.profileContainer}>
            <View style={style.buttonContainer}>
                <VerifyEmailButton />
            </View>
            {profilePicture 
                ? <Image style={style.profilePicture} source={{uri: profilePicture}} />
                : <Image style={style.profilePicture} source={require('../assets/defaultProfilePicture.jpg')} />
            }
            {username
                ? <Text style={style.profileUsername}>@{username}</Text>
                : <Text style={style.profileUsername}>Create a Profile!</Text>
            }
            
            {profileSet
                ?
                <View style={style.buttonContainer}>
                    <TouchableOpacity
                        style={style.button}
                        onPress={() => navigation.push('Edit Profile')}
                    >
                        <Text
                            style={style.buttonText}
                        >Edit Profile</Text>
                    </TouchableOpacity>
                </View>
                :
                <View style={style.buttonContainer}>
                    <TouchableOpacity
                        style={style.button}
                        onPress={() => navigation.push('Create Profile')}
                    >
                        <Text
                            style={style.buttonText}
                        >Create Profile</Text>
                    </TouchableOpacity>
                </View>
            }
        </View>
    );
};

export default SettingsScreen;
