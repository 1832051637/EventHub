import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from '../firebase';
import style from '../styles/style.js';

const ForgotPasswordScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');

    // Sends reset password email to user
    const handleSendEmail = () => {
        sendPasswordResetEmail(auth, email)
        .then(() => {
            Alert.alert("An email to reset your password has been sent!");
            navigation.replace("Login");
        })
        .catch(error => alert("Invalid email address"));
    }

    // Forgot Password GUI
    return (
        <KeyboardAvoidingView style={style.container}>
            <Text style={style.title}>
                Reset Password
            </Text>
            <View style={style.inputContainer}>
                <TextInput
                    placeholder='Enter email'
                    value={email}
                    onChangeText={text => setEmail(text)}
                    style={style.input}

                ></TextInput>
            </View>
            <View style={style.buttonContainer}>
                <TouchableOpacity
                    onPress={handleSendEmail}
                    style={style.button}
                >
                    <Text style={style.buttonText}>Send Email</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ForgotPasswordScreen;