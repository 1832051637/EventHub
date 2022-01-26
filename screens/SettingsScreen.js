import { useNavigation } from '@react-navigation/native';
import { Text, TouchableOpacity, View, Alert } from 'react-native';
import React from 'react';
import { auth } from '../firebase';
import styles from '../styles/styles.js';
import { sendEmailVerification } from "firebase/auth";

const SettingsScreen = () => {
    const handleVerifyEmail = () => {
        sendEmailVerification(auth.currentUser)
        .then(() => {
            Alert.alert("An email to verify your account has been sent!");
        })
        .catch(error => alert(error.message));
    }

    return (
        <View style={styles.container}>
            <Text>User & Profile Settings Here</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={handleVerifyEmail}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Verify Email Address</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default SettingsScreen;