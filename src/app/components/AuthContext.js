// AuthContext.js
'use client';

import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { authReducer, initialState } from './AuthReducer';
import {isTokenExpired, getCookie, decodeToken } from './AuthComponent';
import { authStore } from './AuthStore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if JWT token exists in local storage or cookies on initial render
  useEffect(() => {
    const token = getCookie('token');
    if (token) {
      // Decode token and extract user information
      const decodedToken = decodeToken(token);
      // Check if token is expired
      const isExpired = isTokenExpired(decodedToken);
      console.log('isExpired', isExpired)
      // If token is not expired, dispatch LOGIN action with user information
      if (!isExpired) {
        dispatch({ type: 'LOGIN', payload: { user: decodedToken } });
        authStore.setUsername(decodedToken.userName); // add userName to mobx store
      } else {
        // delete the token from cookies
        document.cookie =  'token=;';
        // If token is expired, dispatch LOGOUT action
        dispatch({ type: 'LOGOUT' });
        authStore.clearUsername(); // delete userName from mobx store
      }
  }
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
