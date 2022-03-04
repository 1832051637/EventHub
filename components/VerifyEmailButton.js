import React from 'react';
import { Text, TouchableOpacity, Alert } from 'react-native';
import { sendEmailVerification } from "firebase/auth";
import style from '../styles/style.js';
import { auth } from '../firebase';

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

export default VerifyEmailButton;