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

const ProfileScreen = () => {
    const [name, setName] = useState('');
    const [profilePicture, setProfilePicture] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    useEffect(async () => {
        try {
            setLoading(true);
            const userRef = doc(db, 'users', auth.currentUser.uid);
            const docData = (await getDoc(userRef)).data();

            setName(docData.name);
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
            <Image style={settingsStyle.profilePicture} source={{uri: profilePicture}} />
            <Text style={settingsStyle.profileUsername}>{name}</Text>
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
            <View style={[style.buttonContainer, {marginTop: 30}]}>
                <VerifyEmailButton />
            </View>
        </View>
    );
};

export default ProfileScreen;
