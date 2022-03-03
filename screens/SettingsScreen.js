import { Text, TouchableOpacity, Image, View, Alert, StyleSheet } from 'react-native';
import React, {useState, useEffect, useContext} from 'react';
import style from '../styles/style.js';
import settingsStyle from '../styles/settingsStyle.js';
import { sendEmailVerification } from "firebase/auth";
import { doc, getDoc} from 'firebase/firestore';
import { auth, db, storage } from '../firebase'
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import LoadingView from '../components/LoadingView';

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
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [loading, setLoading] = useState(true);

    useEffect(async () => {
        try {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            const docData = (await getDoc(userRef)).data();
            setUsername(docData.username);
            setProfilePicture(docData.profilePicture);
            setLoading(false);
        } catch(e) {
            console.error(e);
        }
    }, [isFocused]);

    if (loading) {
        return (<LoadingView />)
    }

    return (
        <View style={settingsStyle.profileContainer}>
            {profilePicture 
                ? <Image style={settingsStyle.profilePicture} source={{uri: profilePicture}} />
                : <Image style={settingsStyle.profilePicture} source={require('../assets/defaultProfilePicture.jpg')} />
            }
            {username
                ? <Text style={settingsStyle.profileUsername}>@{username}</Text>
                : <Text style={settingsStyle.profileUsername}>Create a Profile!</Text>
            }
            
            {(profilePicture && username)
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
            <View style={style.buttonContainer}>
                <VerifyEmailButton />
            </View>
        </View>
    );
};

export default SettingsScreen;
