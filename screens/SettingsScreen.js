import { Text, TouchableOpacity, View, Alert } from 'react-native';
import React from 'react';
import { auth } from '../firebase';
import style from '../styles/style.js';
import { sendEmailVerification } from "firebase/auth";

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
    return (
        <View style={style.container}>
            <Text>User & Profile Settings Here</Text>
            <View style={style.buttonContainer}>
                <VerifyEmailButton />
            </View>
        </View>
    );
};

export default SettingsScreen;