import { StyleSheet, Dimensions } from 'react-native';

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
        marginTop: 5,
    },
    textInput: {
        marginVertical: 5,
        width: '90%',
        fontSize: 20,
        backgroundColor: 'white',
        borderRadius: 5,
    },
    searchButton: {
        marginTop: 100,
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'flex-start',
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
        fontSize: 16,
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
    },
    map: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height * 0.8,
        marginTop: '5%'
    },
});

export default styles;