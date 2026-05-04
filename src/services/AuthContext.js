// src/services/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const AuthContext = createContext(null);

// Configurar Google Sign-In — reemplazar WEB_CLIENT_ID con el tuyo de Google Cloud Console
GoogleSignin.configure({
  webClientId: 'TU_WEB_CLIENT_ID.apps.googleusercontent.com',
  offlineAccess: false,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ],
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Intentar restaurar sesión al arrancar
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        const tokens = await GoogleSignin.getTokens();
        setUser(currentUser.user);
        setAccessToken(tokens.accessToken);
      }
    } catch (e) {
      // No hay sesión guardada
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      setUser(userInfo.user);
      setAccessToken(tokens.accessToken);
      return { success: true };
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return { success: false, error: 'Inicio de sesión cancelado' };
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return { success: false, error: 'Inicio de sesión en progreso' };
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return { success: false, error: 'Google Play Services no disponible' };
      }
      return { success: false, error: 'Error al iniciar sesión' };
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      setUser(null);
      setAccessToken(null);
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    }
  };

  const refreshToken = async () => {
    try {
      const tokens = await GoogleSignin.getTokens();
      setAccessToken(tokens.accessToken);
      return tokens.accessToken;
    } catch (e) {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, signIn, signOut, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
