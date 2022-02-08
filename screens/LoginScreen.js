import React, {  useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

import { auth, db } from '../firebase';
import styles from '../styles/styles.js';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    const handleLogin = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then(userCredentials => {
                const user = userCredentials.user;
                console.log('User just logged in with:', user.email);
            })
            .catch(error => alert(error.message))
    }

    // Login Screen GUI
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior='padding'
        >
            <View style={styles.heading}>
                <Text style={styles.titleEvent}>
                    Event
                </Text>
                <Text style={styles.titleHub}>
                    Hub
                </Text>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                        onPress={() => {navigation.push("Signup")}}
                        style={[styles.button, styles.buttonOutline]}
                    >
                        <Text style={styles.buttonOutlineText}>Sign up</Text>
                </TouchableOpacity>
            </View>
            <Text style={{padding: 25}}>——— OR ———</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder='Email'
                    value={email}
                    onChangeText={text => setEmail(text)}
                    style={styles.input}
                ></TextInput>
                <TextInput
                    placeholder='Password'
                    value={password}
                    onChangeText={text => setPassword(text)}
                    style={styles.input}
                    secureTextEntry
                ></TextInput>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    onPress={handleLogin}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {navigation.push("ForgotPassword")}}
                    style={styles.resetButton}
                >
                    <Text style={styles.resetButtonText}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;