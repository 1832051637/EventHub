import { StyleSheet } from 'react-native';

const settingsStyle = StyleSheet.create({
    profilePicture: {
        height: 150,
        width: 150,
        borderRadius: 75,
        marginBottom: 25
    },
    profileContainer: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'white',
        paddingBottom: 100,
        paddingTop: 25
    },
    profileUsername: {
        fontWeight: '700',
        fontSize: 20,
        marginBottom: 50
    },
    profileUsernameInput: {
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'black',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginBottom: 20
    },
    input: {
        flex: 0.5,
        fontSize: 16,
        paddingTop: 20,
        paddingBottom: 0,
        fontSize: 20,
    }
});

export default settingsStyle;