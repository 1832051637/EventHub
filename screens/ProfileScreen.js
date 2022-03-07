import { Text, TouchableOpacity, Image, View, Alert } from 'react-native';
import React, {useState, useEffect} from 'react';
import style from '../styles/style.js';
import settingsStyle from '../styles/settingsStyle.js';
import { doc, getDoc} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import LoadingView from '../components/LoadingView';
import VerifyEmailButton from '../components/VerifyEmailButton';

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
