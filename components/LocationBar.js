import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { GOOGLE_MAPS_API_KEY } from '@env';

const LocationBar = (props) => {
  let placeholder = props.initialValue ? props.initialValue : 'Enter a new location...';

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons
            name="location-sharp"
            size={20}
            color="black"
            style={{ marginLeft: 1 }}
        />
        <GooglePlacesAutocomplete
          fetchDetails={false}                // We don't need details
          debounce={1500}                     // Search debounce
          minLength={3}                       // Minimum number of chars to start a search 
          query={{
              //key: `${GOOGLE_MAPS_API_KEY}`,  // *** Comment this line out if you dont use Autocomplete***
              language: 'en',
          }}
          onPress={(data, details) => {
            props.setSearchPhrase(data.structured_formatting.main_text);
          }}
          textInputProps={{
              InputComp: TextInput,
              leftIcon: { type: 'font-awesome', name: 'chevron-left' },
              errorStyle: { color: 'red' },
              placeholder: placeholder,
              returnKeyType: "done",
              onChangeText: props.setSearchPhrase,
              onSubmitEditing: props.onSubmit,
              style: styles.input,
          }}
        />
      </View>
    </View>
  );
};
export default LocationBar;

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
  },
  searchBar: {
    padding: 10,
    flexDirection: "row",
    width: "95%",
    backgroundColor: "#e8e8e8",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  input: {
    fontSize: 20,
    marginLeft: 10,
    width: "90%",
  },
});