import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const ForgotPasswordScreen = () => {
    const navigation = useNavigation();
    const [email, setEmail] = useState('');
    const auth = getAuth();

    const handleSendEmail = () => {
        sendPasswordResetEmail(auth, email)
        .then(() => {
            Alert.alert("An email to reset your password has been sent!");
            navigation.replace("Login")
        })
        .catch(error => alert(error.message))
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
});
