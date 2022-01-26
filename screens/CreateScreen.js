import { useNavigation } from '@react-navigation/native';
import { KeyboardAvoidingView, Keyboard, StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase'
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const today = new Date();

const CreateEventScreen = () => {
    const [eventName, setEventName] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [totalUsers, setTotalUsers] = useState(0);
    const [eventLocation, setEventLocation] = useState('');
    const [date, setDate] = useState(today);
    const [showDate, setShowDate] = useState(false);

    const dateChange = (event, newDate) => {
        setShowDate(false);
        setDate(newDate);
    }

    return (
        <KeyboardAwareScrollView>
            <TextInput
                placeholder='Event Name'
                value={eventName}
                onChangeText={text => setEventName(text)}
                style={styles.input}
                multiline={true}
                scrollEnabled={false}
            />
            <TextInput
                placeholder='Event Description'
                value={eventDescription}
                onChangeText={text => setEventDescription(text)}
                style={styles.input}
                multiline={true}
                scrollEnabled={false}
            />
            <TextInput
                placeholder='Total Users'
                value={totalUsers}
                onChangeText={text => setTotalUsers(text)}
                style={styles.input}
                keyboardType={"number-pad"}
            />
            <TextInput
                placeholder='Event Location'
                value={eventLocation}
                onChangeText={text => setEventLocation(text)}
                style={styles.input}
                multiline={true}
                scrollEnabled={false}
            />
            {
                !showDate ?
                    <TextInput
                        placeholder='Date'
                        value={date.toDateString()}
                        onTouchStart={() => setShowDate(true)}
                        style={styles.input}
                    /> : null

            }
            {
                showDate ? <View>
                    <Text style={styles.calenderText}>Choose a Date</Text>
                    <RNDateTimePicker style={styles.calender} value={date} onChange={dateChange} />
                </View> : null
            }
        </KeyboardAwareScrollView>
    );
};

export default CreateEventScreen;

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
    calender: {
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 20,
        marginBottom: 30,
        marginLeft: 25,
        marginRight: 25
    },
    calenderText: {
        color: 'black',
        fontWeight: '700',
        fontSize: 16,
        marginLeft: 25,
        marginRight: 25
    },
    inputContainer: {
        width: '80%'
    },
    input: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 30,
        marginBottom: 20,
        fontSize: 18,
        marginLeft: 25,
        marginRight: 25
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
        fontSize: 24,
    },
    buttonOutlineText: {
        color: '#0782F8',
        fontWeight: '700',
        fontSize: 16,
    },
    resetButton: {
        width: '100%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    resetButtonText: {
        color: 'red',
        fontWeight: '400',
        fontSize: 14,
    }
});