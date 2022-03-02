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
    callOutContainer: {
        flex: 1,
        alignItems: "flex-start",
        maxWidth: 250
    },

    detailText: {
        color: '#0782F8',
    }
});

export default mapStyle;