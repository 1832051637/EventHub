import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const LocationBar = (props) => {
  let placeholder = props.initialValue ? props.initialValue : 'Enter a new location...';

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        {/* search Icon */}
        <Ionicons
          name="location-sharp"
          size={20}
          color="black"
          style={{ marginLeft: 1 }}
        />
        {/* Input field */}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          returnKeyType="done"
          value={props.searchPhrase}
          onChangeText={props.setSearchPhrase}
          onSubmitEditing={props.onSubmit}
        />
        {/* cross Icon, depending on whether the search bar is clicked or not */}
        {false && (
          <Entypo name="cross" size={20} color="black" style={{ padding: 1 }} onPress={() => {
              props.setSearchPhrase("")
          }}/>
        )}
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