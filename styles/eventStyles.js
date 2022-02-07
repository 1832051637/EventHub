import { StyleSheet } from 'react-native';

const eventStyles = StyleSheet.create({
    container: {
        flex: 1,
        // display: "flex",
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 5,
        // justifyContent: 'space-between',
        // backgroundColor: 'white',
        // padding: 40,
        width: '80%',
        // borderRadius: 10

    },
    title: {
        textAlign: 'center',
        fontSize: 28,
        fontWeight: 'bold',
    },
    separator: {
        borderColor: 'rgba(200, 200, 200, 1.0)',
        borderBottomWidth: 1,
        marginVertical: 10,
        width: '100%',
        alignItems: 'center'
    },
    image: {
        width: '90%',
        minHeight: '20%',
        maxHeight: '60%',
        marginTop: '5%',
        marginBottom: '3%',
        resizeMode: 'cover',
        borderRadius: 10,
    },
    category: {
        fontSize: 20,
        fontWeight: 'bold',
        // margin: '5%'
    },
    info: {
        fontSize: 20,
        // fontWeight: 'bold',
    },
});

export default eventStyles;