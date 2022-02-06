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
        paddingLeft: 10,
        paddingRight: 10,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 5,
    },
    heading: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingBottom: 10,
    },
    title: {
        flexGrow: 3,
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        borderColor: 'rgba(200, 200, 200, 1.0)',
        borderBottomWidth: 1,
        marginTop: 10,
        marginBottom: 10,
    },
});

export default feedStyle;