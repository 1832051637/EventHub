import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgb(250, 250, 250)'
    },
    button: {
        backgroundColor: 'white',
        width: '60%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        borderColor: '#0782F8',
        borderWidth: 3
    },
    buttonText: {
        color: '#0782F8',
        fontWeight: '700',
        fontSize: 16,
    },
});

export default styles;