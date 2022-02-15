import { StyleSheet, Dimensions } from 'react-native';
import { withOrientation } from 'react-navigation';

const createStyle = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingTop: 10,
        paddingBottom: 100
    },
    inputContainer: {
        alignSelf: 'stretch',
        marginBottom: 30
    },
    titleInput: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'grey'
    },
    input: {
        fontSize: 16,
        paddingTop: 15,
        paddingBottom: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'grey'
    },
    dateBox: {
        paddingTop: 15,
        paddingBottom: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'grey',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    datePicker: {
       backgroundColor: 'white',
       margin: 5,
       width: 90
    },
});

export default createStyle;