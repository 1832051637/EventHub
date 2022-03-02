import { StyleSheet, Dimensions } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingBottom: 100
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 15
    },
    inputContainer: {
        paddingBottom: 20,
        width: '80%'
    },
    input: {
        backgroundColor: 'white',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 5,
        borderWidth: 1,
        borderColor: 'grey'
    },
    textInput: {
        marginVertical: 5,
        width: '90%',
        fontSize: 20,
        backgroundColor: 'white',
        borderRadius: 5,
    },
    buttonContainer: {
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#0782F8',
        width: '100%',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    attendButton: {
        backgroundColor: '#0782F8',
        width: '80%',
        padding: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        bottom: '1%'
    },
    unAttendButton: {
        borderWidth: 2,
        borderColor: '#0782F8',
        borderRadius: 5,
        color: '#0782F8',
        width: '80%',
        padding: 10,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        bottom: '5%'
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
    unAttendButtonText: {
        color: 'blue',
        fontWeight: '700',
        fontSize: 16,
    },
    buttonOutlineText: {
        color: '#0782F8',
        fontWeight: '700',
        fontSize: 16,
    }
});

export default styles;