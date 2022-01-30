//*******************************************************************************
//
// IMPORTANT: Make sure to check package.json to have all required dependecies installed.
//
//*******************************************************************************

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import React, { useEffect, useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from "./screens/LoginScreen";
import ForgotPasswordScreen from './screens/ForgotPassword';
import MapScreen from './screens/MapScreen';
import Tabs from './util/tabs';

const Stack = createNativeStackNavigator();


export default function App() {
  const backButton = (navigation) => (
    <Button onPress={navigation.replace("Login")} title="Sign Out" color="#0782F8" />
  )

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen options={{ headerShown: false }} name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: "" }} />
        <Stack.Screen name="Map" component={MapScreen} options={{ title: "Map Screen" }} />
      </Stack.Navigator>
      {/* <Tabs /> */}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});