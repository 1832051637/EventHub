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
    profilePicture: {
        height: 150,
        width: 150,
        borderRadius: 75,
        marginBottom: 25
    },
    profileContainer: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
        paddingBottom: 100,
        paddingTop: 25
    },
    profileUsername: {
        fontWeight: '700',
        fontSize: 20,
        marginBottom: 50
    },
    profileUsernameInput: {
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'black',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginBottom: 20
    },
    input: {
        flex: 0.5,
        fontSize: 16,
        paddingTop: 20,
        paddingBottom: 0,
        fontSize: 20,
    },
});

export default styles;