import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import AttendingScreen from '../screens/AttendingScreen';
import HostingScreen from '../screens/HostingScreen';

const Tab = createMaterialTopTabNavigator();

const MyEventsTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Attending" component={AttendingScreen} />
      <Tab.Screen name="Hosting" component={HostingScreen} />
    </Tab.Navigator>
  );
}

export default MyEventsTabs;
