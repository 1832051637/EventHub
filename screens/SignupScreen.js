import React, {  useState } from 'react';
import { KeyboardAvoidingView, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; 
import { auth, db } from '../firebase';
import style from '../styles/style.js';
import authStyle from '../styles/authStyle.js';

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

                return setDoc(doc(db, 'users', user.uid), {
                    name: firstName + " " + lastName,
                    attending: [],
                    hosting: []
                })
            })
            .catch(error => alert(error.message))
    }

    // Login Screen GUI
    return (
        <KeyboardAvoidingView
            style={style.container}
            //behavior='padding'
        >
            <View style={authStyle.heading}>
                <Text style={authStyle.titleEvent}>
                    Event
                </Text>
                <Text style={authStyle.titleHub}>
                    Hub
                </Text>
            </View>
            <View style={style.inputContainer}>
                <TextInput
                    placeholder='First name'
                    value={firstName}
                    onChangeText={text => setFirstName(text)}
                    style={style.input}
                ></TextInput>
                <TextInput
                    placeholder='Last name'
                    value={lastName}
                    onChangeText={text => setLastName(text)}
                    style={style.input}
                ></TextInput>
                <TextInput
                    placeholder='Email'
                    value={email}
                    onChangeText={text => setEmail(text)}
                    style={style.input}
                ></TextInput>
                <TextInput
                    placeholder='Password'
                    value={password}
                    onChangeText={text => setPassword(text)}
                    style={style.input}
                    secureTextEntry
                ></TextInput>
            </View>
            <View style={style.buttonContainer}>
                <TouchableOpacity
                    onPress={handleSignUp}
                    style={[style.button, style.buttonOutline]}
                >
                    <Text style={style.buttonOutlineText}>Sign up</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default SignupScreen;