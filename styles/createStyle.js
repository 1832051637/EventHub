import { StyleSheet, Dimensions } from 'react-native';

const createStyle = StyleSheet.create({
    container: {
        height: '100%',
         backgroundColor: 'white'
    },
    scroll: {
        alignItems: 'center',
        paddingTop: 10,
    },
    inputContainer: {
        alignSelf: 'stretch',
        marginBottom: 20
    },
    titleInput: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        paddingLeft: 30,
        paddingTop: 15,
        paddingBottom: 15,
    },
    inputItem: {
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'grey',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start'
    },
    input: {
        flex: 1,
        fontSize: 16,
        paddingTop: 20,
        paddingBottom: 20,
    },
    icon: {
        marginVertical: 20,
        marginRight: 10
    },
    dateBox: {
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'grey',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexWrap: "wrap"
    },
    datePicker: {
       backgroundColor: 'white',
       width: 90,
    },
    datePickerText: {
        marginHorizontal: 7,
    },
    imageSelect: {
        borderBottomWidth: 1,
        borderBottomColor: 'grey',
    },
    imageButton: {
        paddingHorizontal: 10,
        fontSize: 16,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    image: {
        marginVertical: 20,
        width: (Dimensions.get('window').width / 2),
        height: 100,
        borderRadius: 5,
    },
    deleteButton: {
        //padding: 5,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    deleteButtonText: {
        color: 'rgb(200, 0, 0)',
        fontSize: 18
    }
});

export default createStyle;