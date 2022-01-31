import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { auth } from '../firebase';
import styles from '../styles/homeStyle.js';

const EventCard = () => {
    return;
}

const FeedScreen = () => {
    const navigation = useNavigation();

    const handleSignOut = () => {
        auth.signOut().catch(error => alert(error.message))
    }

    const handleMap = () => {
        navigation.navigate("Map");
    }

    // Home screen GUI
    return (
        <View style={styles.container}>
            <Text>Hello, email: {auth.currentUser?.email}</Text>
            <Text>Welcome to EventHub</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={handleMap}
            >
                <Text
                    style={styles.buttonText}
                >View Map</Text>
            </TouchableOpacity>

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

export default FeedScreen;
