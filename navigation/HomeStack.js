import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SignOutButton from '../components/SignOutButton';
import MapScreen from '../screens/MapScreen';
import FeedScreen from '../screens/FeedScreen'
import EventScreen from '../screens/EventScreen'

const Stack = createNativeStackNavigator();

export default HomeStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Feed" component={FeedScreen} options={{
                headerShown: false
            }} />
            <Stack.Screen name="Event Details" component={EventScreen} options={{
            }} />
        </Stack.Navigator>
    );
}