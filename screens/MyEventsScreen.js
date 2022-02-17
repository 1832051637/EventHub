import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, Button } from 'react-native';

import { useNavigation } from '@react-navigation/native';
//import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

//const Tab = createMaterialTopTabNavigator();

const MyEventsScreen = () => {
    
    const navigation = useNavigation();

    return (
    
        <TouchableOpacity 
            style ={{
                flex: 1,
                justifyContent: 'top',
                alignItems: 'center',
                padding: 40,
                backgroundColor: 'white',

            }}> 

            <Button
                
                title="Attending Events &#10140;"
                onPress={() => navigation.navigate('Attending')}
                
            />

            <Button
                title="Hosting Events &#10140;"
                onPress={() => navigation.navigate('Hosting')}
            />  

        </TouchableOpacity>
    
    );
}

export default MyEventsScreen;
