import { StyleSheet, Dimensions } from 'react-native';

const mapStyle = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingBottom: 100
    },
    map: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height * 0.8,
        marginTop: '2%'
    },
    calloutContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: 200,
        padding: 5
    },
    calloutTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10
    },
    calloutBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
    },
    calloutDistance: {
        fontSize: 14,
        marginRight: 20
    },
    detailText: {
        fontSize: 14,
        color: '#0782F8',
    }
});

export default mapStyle;