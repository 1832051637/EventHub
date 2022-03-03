import { StyleSheet } from 'react-native';

const settingsStyle = StyleSheet.create({
    profileContainer: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
        paddingBottom: 100,
        paddingTop: 30
    },
    profilePicture: {
        height: 150,
        width: 150,
        borderRadius: 75,
        marginBottom: 25
    },
    pictureContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileUsername: {
        fontWeight: '700',
        fontSize: 20,
        marginBottom: 50
    },
    cameraIcon: {
        opacity: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#000',
        borderRadius: 10,
    }
});

export default settingsStyle;