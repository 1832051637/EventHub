import { StyleSheet } from 'react-native';

const feedStyle = StyleSheet.create({
    feed: {
        padding: 20,
        width: '100%'
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
    }
});

export default feedStyle;