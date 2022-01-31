import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../firebase';
import styles from '../styles/styles.js';

const ForgotPasswordScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');

    const handleSendEmail = () => {
        sendPasswordResetEmail(auth, email)
        .then(() => {
            Alert.alert("An email to reset your password has been sent!");
            navigation.replace("Login")
        })
        .catch(error => alert(error.message));
    }

    // Forgot Password GUI
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior='padding'
        >
            <View>
                <Text
                    style={styles.title}
                >Reset Password</Text>
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder='Enter email'
                    value={email}
                    onChangeText={text => setEmail(text)}
                    style={styles.input}

                ></TextInput>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={handleSendEmail}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Send Email</Text>
                </TouchableOpacity>
            </View>
            

        </KeyboardAvoidingView>
    );
};

export default ForgotPasswordScreen;