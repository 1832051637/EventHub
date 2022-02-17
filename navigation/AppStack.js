import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppTabs from './AppTabs';
import EventScreen from '../screens/EventScreen';
import EditEventScreen from '../screens/EditEventScreen';

const Stack = createNativeStackNavigator();

export default AppStack = () => {
    return (  
        <Stack.Navigator>
            <Stack.Screen options={{ headerShown: false }} name="Main Tabs" component={AppTabs} />
            <Stack.Screen name="Event Details" component={EventScreen} />
            <Stack.Screen name="Edit Event" component={EditEventScreen} />
        </Stack.Navigator>
    );
}