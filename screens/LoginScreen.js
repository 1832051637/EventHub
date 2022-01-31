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

    const handleSignUp = () => {
        createUserWithEmailAndPassword(auth, email, password)
            .then(userCredentials => {
                const user = userCredentials.user;
                console.log('A new user just registered:', user.email);
                Alert.alert('Great!', 'You just created a new acount. Now it\'s time to login!');

                return db.collection('users').doc(user.uid);
            })
            .catch(error => alert(error.message))
    }
    const handleLogin = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then(userCredentials => {
                const user = userCredentials.user;
                console.log('User just logged in with:', user.email);
            })
            .catch(error => alert(error.message))
    }

    const handleForgot = () => {
        navigation.push("ForgotPassword");
    }

    // Login Screen GUI
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior='padding'
        >
            <View>
                <Text
                    style={styles.title}
                >Event Hub</Text>
            </View>
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
                    onPress={handleSignUp}
                    style={[styles.button, styles.buttonOutline]}
                >
                    <Text style={styles.buttonOutlineText}>Sign up</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleForgot}
                    style={styles.resetButton}
                >
                    <Text style={styles.resetButtonText}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;