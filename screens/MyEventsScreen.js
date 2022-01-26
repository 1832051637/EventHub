import { useNavigation } from '@react-navigation/native';
import { Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { auth } from '../firebase';
import styles from '../styles/styles.js';


const MyEventsScreen = () => {
    return (
        <View style={styles.container}>
            <Text>View the events you are attending/created here</Text>
        </View>
    );
};

export default MyEventsScreen;