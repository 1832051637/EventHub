import React, {  useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebase';
import style from '../styles/style.js';
import authStyle from '../styles/authStyle.js';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    // Logs in the user from the inputted email/password
    const handleLogin = () => {
        signInWithEmailAndPassword(auth, email, password)
            .catch(error => alert("Invalid username or password"))
    }

    // Login Screen GUI
    return (
        <KeyboardAvoidingView
            style={style.container}
            behavior='padding'
        >
            <View style={authStyle.heading}>
                <Text style={authStyle.titleEvent}>
                    Event
                </Text>
                <Text style={authStyle.titleHub}>
                    Hub
                </Text>
            </View>
            <View style={style.buttonContainer}>
                <TouchableOpacity
                        onPress={() => {navigation.push("Signup")}}
                        style={[style.button, style.buttonOutline]}
                    >
                        <Text style={style.buttonOutlineText}>Sign up</Text>
                </TouchableOpacity>
            </View>
            <Text style={{padding: 25}}>——— OR ———</Text>
            <View style={style.inputContainer}>
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
                    onPress={handleLogin}
                    style={style.button}
                >
                    <Text style={style.buttonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {navigation.push("ForgotPassword")}}
                    style={authStyle.resetButton}
                >
                    <Text style={authStyle.resetButtonText}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;