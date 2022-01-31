//*******************************************************************************
//
// IMPORTANT: Make sure to check package.json to have all required dependecies installed.
//
//*******************************************************************************

import React from 'react';

import { AuthenticatedUserProvider } from './utils/AuthenticatedUserProvider';
import RootNavigator from './navigation/RootNavigator';

export default function App() {
    return (
        <AuthenticatedUserProvider>
            <RootNavigator />
        </AuthenticatedUserProvider>
    );
}
