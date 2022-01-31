import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SignOutButton from '../components/SignOutButton';
import MapScreen from '../screens/MapScreen';
import FeedScreen from '../screens/FeedScreen'

const Stack = createNativeStackNavigator();

export default HomeStack = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Feed" component={FeedScreen} options={{ 
                headerRight: SignOutButton 
            }}/>
            <Stack.Screen name="Map" component={MapScreen} options={{ 
                headerRight: SignOutButton 
            }}/>
        </Stack.Navigator>
    );
}