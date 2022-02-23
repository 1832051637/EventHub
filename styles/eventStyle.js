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
});

export default eventStyle;