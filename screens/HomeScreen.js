import { useNavigation } from '@react-navigation/native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { auth } from '../firebase';
;


const HomeScreen = () => {
    const navigation = useNavigation();
    const handleSignOut = () => {
        auth.signOut().then(() => {
            navigation.replace("Login")
        })
            .catch(error => alert(error.message))
    }

    return (
        <View style={styles.container}>
            <Text>Hello, email: {auth.currentUser?.email}</Text>
            <Text>Welcome to Eventhub</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={handleSignOut}
            >
                <Text
                    style={styles.buttonText}
                >Signout</Text>
            </TouchableOpacity>
        </View>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    button: {
        backgroundColor: 'white',
        width: '60%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        borderColor: '#0782F9',
        borderWidth: 3
    },
    buttonText: {
        color: '#0782F9',
        fontWeight: '700',
        fontSize: 16,
    },
})
