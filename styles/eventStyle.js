import { StyleSheet } from 'react-native';

const eventStyle = StyleSheet.create({
    title: {
        textAlign: 'center',
        fontSize: 28,
        fontWeight: 'bold',
        paddingBottom: 15
    },
    mainContainer: {
        flex: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        fontSize: 18,
    },
    hostContainer: {
        flexDirection: 'row', 
        alignItems: 'center', 
        textAlign: 'center',
        paddingBottom: 10,
    },
    hostText: {
        fontSize: 16,
    },
    description: {
        fontSize: 18,
    },
    footerContainer: {
        padding: 10
    },
    footerText: {
        fontSize: 18,
        marginBottom: 5
    },
    locationText: {
        textDecorationLine: 'underline',
        fontSize: 18,
        marginBottom: 5
    },
    icon: {
        fontWeight: 'bold'
    },
    separator: {
        borderColor: 'rgba(200, 200, 200, 1.0)',
        borderBottomWidth: 1,
        marginVertical: 10,
        width: '90%',
        alignSelf: 'center'
    },
    image: {
        width: '100%',
        height: 200,
    },
    pfp: {
        width: 25,
        height: 25,
        borderRadius: 100,
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
    unattendButton: {
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
    unattendButtonText: {
        color: 'blue',
        fontWeight: '700',
        fontSize: 16,
    },
});

export default eventStyle;