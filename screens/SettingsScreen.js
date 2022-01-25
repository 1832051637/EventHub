import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { auth } from '../firebase';


const SettingsScreen = () => {
    return (
        <View style={styles.container}>
            <Text>User & Profile Settings Here</Text>
        </View>
    );
};

export default SettingsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
});