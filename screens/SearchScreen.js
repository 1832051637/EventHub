import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { auth } from '../firebase';
import styles from '../styles/styles.js';


const SearchScreen = () => {
    return (
        <View style={styles.container}>
            <Text>Search for an event</Text>
        </View>
    );
};

export default SearchScreen;