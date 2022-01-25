import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { auth } from '../firebase';


const MyEventsScreen = () => {
    return (
        <View style={styles.container}>
            <Text>View the events you are attending/created here</Text>
        </View>
    );
};

export default MyEventsScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
});