import React from 'react';
import {  Button } from 'react-native';

import { auth } from '../firebase';

export default SignOutButton = () => {
    const handleSignOut = () => {
        auth.signOut().catch(error => alert(error.message))
    }

    return (
        <Button onPress={handleSignOut} title="Sign Out" color="#0782F8" />
    );
}