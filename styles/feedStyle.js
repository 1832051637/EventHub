import { StyleSheet } from 'react-native';

const feedStyle = StyleSheet.create({
    feed: {
        paddingTop: 20,
        alignSelf: 'stretch',
        backgroundColor: 'white'
    },
    card: {
        flex: 1,
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 5,
    },
    body: {
        paddingHorizontal: 5,
    },
    heading: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 5
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 10,
        flex: 1,
    },
    timestamp: {
        marginBottom: 5,
    },
    location: {
        marginBottom: 5,
    },
    separator: {
        borderColor: 'rgba(200, 200, 200, 1.0)',
        borderBottomWidth: 1,
        marginVertical: 20,
    },
    footer: {
        marginVertical: 40,
    }
});

export default feedStyle;