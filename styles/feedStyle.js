import { StyleSheet } from 'react-native';

const feedStyle = StyleSheet.create({
    feed: {
        paddingTop: 20,
        alignSelf: 'stretch',
    },
    card: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: 'rgb(250, 250, 250)',
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
    description: {
    },
    separator: {
        borderColor: 'rgba(200, 200, 200, 1.0)',
        borderBottomWidth: 1,
        marginTop: 15,
        marginBottom: 15,
    },
});

export default feedStyle;