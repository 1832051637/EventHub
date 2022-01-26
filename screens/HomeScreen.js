import { useNavigation } from '@react-navigation/native';
import { Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { auth } from '../firebase';
import styles from '../styles/homeStyle.js';

const HomeScreen = () => {
    const navigation = useNavigation();
    const handleSignOut = () => {
        auth.signOut().then(() => {
            navigation.replace("Login")
        })
            .catch(error => alert(error.message))
    }

    // Home screen GUI
    return (
        <View style={styles.container}>
            <Text>Hello, email: {auth.currentUser?.email}</Text>
            <Text>Welcome to EventHub</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={handleSignOut}
            >
                <Text
                    style={styles.buttonText}
                >Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
};

export default HomeScreen;
