import { StyleSheet } from 'react-native';

const feedStyle = StyleSheet.create({
    feed: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        width: '100%',
        marginVertical: 20,
    },
    card: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: 'white',
        padding: 40,
        width: '100%',
        borderRadius: 10
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingBottom: 10
    },
    separator: {
        borderColor: 'rgba(200, 200, 200, 1.0)',
        borderBottomWidth: 1,
        margin: 10,
        //width: '100%'
    },
    button: {
        backgroundColor: '#0782F8',
        width: '45%',
        padding: 5,
        borderRadius: 10,
        marginTop: 10
        // alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default feedStyle;