import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';

const AuthContext = createContext(null);

// Reemplazar con el webClientId de Google Cloud Console
GoogleSignin.configure({
  webClientId: 'TU_WEB_CLIENT_ID.apps.googleusercontent.com',
  offlineAccess: true,
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
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        const tokens = await GoogleSignin.getTokens();
        setUser({ ...currentUser.user, provider: 'google' });
        setAccessToken(tokens.accessToken);
      }
    } catch (_) {
      // No hay sesión previa guardada
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      setUser({ ...userInfo.user, provider: 'google' });
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
      return { success: false, error: 'Error al iniciar sesión con Google' };
    }
  };

  // Sign in with Apple — requerido por App Store (Guideline 4.8)
  const signInWithApple = async () => {
    try {
      const nonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString(36).substring(2)
      );
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce,
      });
      // Apple solo devuelve nombre y email en el primer login
      const appleUser = {
        id: credential.user,
        email: credential.email,
        name: credential.fullName?.givenName
          ? `${credential.fullName.givenName} ${credential.fullName.familyName || ''}`.trim()
          : 'Usuario Apple',
        photo: null,
        provider: 'apple',
      };
      setUser(appleUser);
      // Apple no provee un accessToken para Google Sheets; el usuario deberá
      // conectar Google Drive por separado si quiere sincronización.
      setAccessToken(null);
      return { success: true };
    } catch (error) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        return { success: false, error: 'Inicio de sesión cancelado' };
      }
      return { success: false, error: 'Error al iniciar sesión con Apple' };
    }
  };

  const signIn = (provider = 'google') =>
    provider === 'apple' ? signInWithApple() : signInWithGoogle();

  const signOut = async () => {
    try {
      if (user?.provider === 'google') {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      }
      setUser(null);
      setAccessToken(null);
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    }
  };

  // Renueva el access token de Google; retorna el nuevo token o null
  const refreshToken = async () => {
    if (user?.provider !== 'google') return null;
    try {
      await GoogleSignin.clearCachedAccessToken(accessToken);
      const tokens = await GoogleSignin.getTokens();
      setAccessToken(tokens.accessToken);
      return tokens.accessToken;
    } catch (_) {
      return null;
    }
  };

  const isAppleSignInAvailable = Platform.OS === 'ios';

  return (
    <AuthContext.Provider
      value={{ user, accessToken, loading, signIn, signOut, refreshToken, isAppleSignInAvailable }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
