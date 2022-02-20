import { StyleSheet, Dimensions } from 'react-native';

const mapStyle = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingBottom: 100
    },
    searchContainer: {
        // borderWidth: 2,
        // borderRadius: 10,
        // backgroundColor: 'white',
        marginTop: 5,
        flexDirection: 'row',
        width: "95%",
        alignItems: 'center'
    },
    map: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height * 0.8,
        marginTop: '2%'
    },
    input: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'grey',
        marginRight: '2%',
        width: '80%'
    },
    button: {
        backgroundColor: 'white',
        width: '15%',
        padding: 10,
        borderRadius: 10,
        borderColor: '#0782F8',
        borderWidth: 2,
        alignItems: 'center',
        marginLeft: '2%',
    },
    buttonText: {
        color: '#0782F8',
        fontWeight: '700',
        fontSize: 16,
    },

    callOutContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        width: 150
        // flex: 1,
        // // width: "99%",
    },
});

export default mapStyle;