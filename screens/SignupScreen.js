import React, {  useState } from 'react';
import { KeyboardAvoidingView, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';

import { createUserWithEmailAndPassword } from "firebase/auth";

import { doc, setDoc } from "firebase/firestore"; 

import { auth, db } from '../firebase';
import styles from '../styles/styles.js';

const SignupScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const handleSignUp = () => {
        if (firstName === '' || lastName === '') {
            Alert.alert('Please enter your first and last name');
            return;
        }
        createUserWithEmailAndPassword(auth, email, password)
            .then(userCredentials => {
                const user = userCredentials.user;
                console.log('A new user just registered:', user.email);

                return setDoc(doc(db, 'users', user.uid), {
                    firstName: firstName,
                    lastName: lastName,
                    attending: [],
                    hosting: []
                })
            })
            .catch(error => alert(error.message))
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
                    placeholder='First name'
                    value={firstName}
                    onChangeText={text => setFirstName(text)}
                    style={styles.input}
                ></TextInput>
                <TextInput
                    placeholder='Last name'
                    value={lastName}
                    onChangeText={text => setLastName(text)}
                    style={styles.input}
                ></TextInput>
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
                    onPress={handleSignUp}
                    style={[styles.button, styles.buttonOutline]}
                >
                    <Text style={styles.buttonOutlineText}>Sign up</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default SignupScreen;