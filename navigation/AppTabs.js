import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

import SignOutButton from '../components/SignOutButton';
//import HomeStack from './HomeStack';
import CreateScreen from '../screens/CreateScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MapScreen from '../screens/MapScreen';
import FeedScreen from '../screens/FeedScreen';
import MyEventsScreen from '../screens/MyEventsScreen';

const Tab = createBottomTabNavigator();

AppTabs = () => {
    const navigation = useNavigation();

    return (
        <Tab.Navigator
        screenOptions={{
            tabBarStyle: { position: 'absolute' },
            tabBarActiveTintColor: '#008EFF',
        }}
        >
        <Tab.Screen name="Feed" component={FeedScreen} options={{
            tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
            ),
            headerShown: false
        }} />
        <Tab.Screen name="Map" component={MapScreen} options={{
            tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map" color={color} size={size} />
            ),
            headerShown: false
        }} />
        <Tab.Screen name="Create" component={CreateScreen} options={{
            headerTitle: 'Create Event',
            tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus-box-outline" color={color} size={size} />
            ),
        }} />
        <Tab.Screen name="My Events" component={MyEventsScreen} options={{
            tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" color={color} size={size} />
            ),
        }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{
            tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
            ),
            headerRight: SignOutButton
        }} />
        </Tab.Navigator>
    );
}

export default AppTabs;