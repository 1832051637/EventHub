import { StyleSheet } from 'react-native';

const eventStyles = StyleSheet.create({
    container: {
        flex: 1,
        // display: "flex",
        justifyContent: 'center',
        alignItems: 'center'
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
        fontSize: 20,
        fontWeight: 'bold',
        // paddingBottom: 10
    },
    separator: {
        // flex: 1,
        borderColor: 'rgba(200, 200, 200, 1.0)',
        borderBottomWidth: 1,
        margin: 10,
        minWidth: '80%'
    },
    image: {
        // flex: 1,
        // justifyContent: 'space-between',
        // flexDirection: 'row',
        // alignItems: 'center',
        // top: '-30%',
        maxWidth: '20%',
        maxHeight: '20%',
    },
    category: {
        fontWeight: 'bold',
    }
});

export default eventStyles;