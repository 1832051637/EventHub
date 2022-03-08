import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase.js';
import { AuthenticatedUserContext } from '../utils/AuthenticatedUserProvider';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

export default RootNavigator = () => {
  const { user, setUser } = useContext(AuthenticatedUserContext);

  useEffect(() => {
    const unsubscribeAuthStateChanged = onAuthStateChanged(
      auth,
      authenticatedUser => {
        authenticatedUser ? setUser(authenticatedUser) : setUser(null);
      }
    );

    return unsubscribeAuthStateChanged;
  }, [user]);

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};
