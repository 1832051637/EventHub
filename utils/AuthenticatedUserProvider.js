import React, { useState, createContext } from 'react';

export const AuthenticatedUserContext = createContext({});

// Context to track if user is signed-in
export const AuthenticatedUserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    return (
        <AuthenticatedUserContext.Provider value={{ user, setUser }}>
            {children}
        </AuthenticatedUserContext.Provider>
    );
};
