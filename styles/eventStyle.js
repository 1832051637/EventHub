import { StyleSheet, Dimensions } from 'react-native';

const eventStyle = StyleSheet.create({
    title: {
        textAlign: 'center',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10
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
        paddingBottom: 15,
    },
    hostText: {
        fontSize: 18,
    },
    description: {
        fontSize: 18,
    },
    footerContainer: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 10
    },
    footerTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8
    },
    footerText: {
        fontSize: 18,
    },
    locationText: {
        flex: 1,
        textDecorationLine: 'underline',
        fontSize: 18, 
    },
    icon: {
        fontWeight: 'bold',
        marginRight: 10
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
        width: 30,
        height: 30,
        borderRadius: 100,
        marginRight: 5
    },
    mapContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    map: {
        flex: 1,
        width: Dimensions.get('window').width * 0.9,
        height: Dimensions.get('window').width * 0.9,
        borderRadius: 10
    },
});

export default eventStyle;