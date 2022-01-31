import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {  Button } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import { auth } from '../firebase';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import CreateScreen from '../screens/CreateScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MyEventsScreen from '../screens/MyEventsScreen';

const Tab = createBottomTabNavigator();

AppTabs = ()  => {
  const navigation = useNavigation();

  const handleSignOut = () => {
    auth.signOut().catch(error => alert(error.message))
  }

  const signOutButton = () => (
    <Button onPress={handleSignOut} title="Sign Out" color="#0782F8" />
  )

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { position: 'absolute' },
        tabBarActiveTintColor: '#008EFF',
      }}
    >
      <Tab.Screen name="HomeScreen" component={HomeScreen} options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="home" color={color} size={size} />
        ),
        headerRight: signOutButton
      }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="magnify" color={color} size={size} />
        ),
        headerRight: signOutButton
      }} />
      <Tab.Screen name="Create" component={CreateScreen} options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="plus-box-outline" color={color} size={size} />
        ),
        headerRight: signOutButton
      }} />
      <Tab.Screen name="My Events" component={MyEventsScreen} options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="calendar" color={color} size={size} />
        ),
        headerRight: signOutButton
      }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="cog" color={color} size={size} />
        ),
        headerRight: signOutButton
      }} />
    </Tab.Navigator>
  );
}

export default AppTabs;