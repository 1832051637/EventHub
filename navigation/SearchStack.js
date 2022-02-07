import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SearchScreen from '../screens/SearchScreen'
import EventScreen from '../screens/EventScreen'

const Stack = createNativeStackNavigator();

export default SearchStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Search" component={SearchScreen} options={{
                // headerRight: SignOutButton
            }} />
            <Stack.Screen name="Event Details" component={EventScreen} options={{
                // headerRight: SignOutButton
            }} />
        </Stack.Navigator>
    );
}