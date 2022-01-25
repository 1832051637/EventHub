import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth"
const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();
    // // Don't need the following but this is included in the tutorial
    // useEffect(() => {
    //     const unsubscribe = auth.onAuthStateChanged(user => {
    //         if (user) {
    //             navigation.replace("Home")
    //         }
    //     })
    //     return unsubscribe;
    // }, [])
    const handleSignUp = () => {
        createUserWithEmailAndPassword(auth, email, password)
            .then(userCredentials => {
                const user = userCredentials.user;
                console.log('A new user just registered:', user.email);
                Alert.alert('Great!', 'You just created a new acount. Now it\'s time to login!');
            })
            .catch(error => alert(error.message))
    }
    const handleLogin = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then(userCredentials => {
                const user = userCredentials.user;
                console.log('User just logged in with:', user.email);
                // If login is successful, navigate to home screen
                navigation.replace("Home");
            })
            .catch(error => alert(error.message))
    }

    const handleForgot = () => {
        navigation.replace("ForgotPassword");
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
// Login screen style sheet
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        paddingVertical: 20,
    },
    inputContainer: {
        width: '80%'
    },
    input: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 5,
    },
    buttonContainer: {
        width: '60%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
    },
    button: {
        backgroundColor: '#0782F8',
        width: '100%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonOutline: {
        backgroundColor: 'white',
        marginTop: 5,
        borderColor: '#0782F8',
        borderWidth: 2,
    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    buttonOutlineText: {
        color: '#0782F8',
        fontWeight: '700',
        fontSize: 16,
    },
    resetButton: {
        width: '100%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    resetButtonText: {
        color: 'red',
        fontWeight: '400',
        fontSize: 14,
    }
});