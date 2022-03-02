import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateProfileScreen from '../screens/CreateProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import { Button } from 'react-native';
import { auth } from '../firebase';
import SignOutButton from '../components/SignOutButton';

const Stack = createNativeStackNavigator();

export default SettingsStack = () => {
    return (  
        <Stack.Navigator>
            <Stack.Screen name="Settings" component={SettingsScreen} options={{headerRight: SignOutButton}}
            />
            <Stack.Screen name="Create Profile" component={CreateProfileScreen} 
                options={({ navigation }) => ({
                    headerLeft: () => (
                      <Button onPress={() => navigation.goBack()} title="Cancel"/>
                    ),
                })}
            />
            <Stack.Screen name="Edit Profile" component={EditProfileScreen} 
                options={({ navigation }) => ({
                    headerLeft: () => (
                      <Button onPress={() => navigation.goBack()} title="Cancel"/>
                    ),
                })}
            />
        </Stack.Navigator>
    );
}