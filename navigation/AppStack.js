import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppTabs from './AppTabs';
import EventScreen from '../screens/EventScreen';
import EditEventScreen from '../screens/EditEventScreen';
import MapScreen from '../screens/MapScreen';
import { Button } from 'react-native';
import { auth } from '../firebase';

const Stack = createNativeStackNavigator();

export default AppStack = () => {
    return (  
        <Stack.Navigator>
            <Stack.Screen options={{ headerShown: false }} name="Main Tabs" component={AppTabs} />
            <Stack.Screen name="Event Details" component={EventScreen} 
                options={({ route, navigation }) => ({
                    headerRight: () => (   
                       auth.currentUser.uid === route.params.host
                        ? <Button onPress={() => navigation.push("Edit Event", {eventID: route.params.eventID}) } title="Edit"/>
                        : <></>
                    ),
                })}
            />
            <Stack.Screen name="Edit Event" component={EditEventScreen} 
                options={({ navigation }) => ({
                    headerLeft: () => (
                      <Button onPress={() => navigation.goBack()} title="Cancel"/>
                    ),
                })}
            />
            <Stack.Screen name="Map Screen" component={MapScreen} 
                options={({ navigation }) => ({
                    headerLeft: () => (
                      <Button onPress={() => navigation.goBack()} title="Back"/>
                    ),
                })}
            />
        </Stack.Navigator>
    );
}