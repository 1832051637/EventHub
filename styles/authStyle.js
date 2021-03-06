import { StyleSheet } from 'react-native';

const authStyle = StyleSheet.create({
    heading: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 30,
    },
    hub: {
        marginLeft: 2,
        paddingHorizontal: 5,
        backgroundColor: '#0782F8',
        borderRadius: 5
    },
    titleEvent: {
        fontSize: 32,
        fontWeight: '800',
        color: '#303030'
    },
    titleHub: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        
    },
    resetButton: {
        width: '100%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    resetButtonText: {
        color: '#0782F8',
        fontWeight: '400',
        fontSize: 16,
    },
});

export default authStyle;