import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { auth } from '../firebase';
import styles from '../styles/styles.js';


const CreateScreen = () => {
    return (
        <View style={styles.container}>
            <Text>Create an Event</Text>
        </View>
    );
};

export default CreateScreen;