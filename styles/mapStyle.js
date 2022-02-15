import { StyleSheet, Dimensions } from 'react-native';

const mapStyle = StyleSheet.create({
    map: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height * 0.8,
        marginTop: '5%'
    },
});

export default mapStyle;