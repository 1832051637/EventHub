import React, {  useState } from 'react';
import { KeyboardAvoidingView, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; 
import { auth, db } from '../firebase';
import style from '../styles/style.js';
import authStyle from '../styles/authStyle.js';
import { profileValidator, inputValidationAlert } from '../utils/generalUtils';

const SignupScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const handleSignUp = () => {
        // Validates sign up info
        let validation = profileValidator(firstName, lastName);
        if (!validation.valid) {
            inputValidationAlert(validation.errors);
            return;
        } 

        // Creates a user with the given email/password
        createUserWithEmailAndPassword(auth, email, password)
            .then(userCredentials => {
                const user = userCredentials.user;

                // Sets a corresponding user doc in firebase with the inputted name
                return setDoc(doc(db, 'users', user.uid), {
                    firstName: firstName,
                    lastName: lastName,
                    name: firstName + " " + lastName,
                    profilePicture: 'https://firebasestorage.googleapis.com/v0/b/event-hub-29d5a.appspot.com/o/defaultProfilePicture.jpg?alt=media&token=acb8706e-8b4a-401d-a29a-85a85add1f53',
                    imageID: '',
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
        >
            <View style={authStyle.heading}>
                <Text style={authStyle.titleEvent}>
                    Event
                </Text>
                <View style={authStyle.hub}>
                    <Text style={authStyle.titleHub}>
                        hub
                    </Text>
                </View>
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