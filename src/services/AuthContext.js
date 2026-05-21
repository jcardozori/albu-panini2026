import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';

const AuthContext = createContext(null);

// webClientId leído desde app.json → extra.googleWebClientId (nunca hardcodeado en código fuente)
const WEB_CLIENT_ID = Constants.expoConfig?.extra?.googleWebClientId;

if (!WEB_CLIENT_ID || WEB_CLIENT_ID.includes('TU_WEB_CLIENT_ID')) {
  console.warn('[AuthContext] googleWebClientId no está configurado en app.json > extra');
}

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
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
      // Log diagnóstico — ayuda a identificar el código de error exacto
      console.warn('[GoogleSignIn] error.code:', error?.code);
      console.warn('[GoogleSignIn] error.message:', error?.message);

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        return { success: false, error: 'Inicio de sesión cancelado' };
      } else if (error.code === statusCodes.IN_PROGRESS) {
        return { success: false, error: 'Inicio de sesión en progreso' };
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return { success: false, error: 'Google Play Services no disponible' };
      } else if (error.code === '10') {
        // DEVELOPER_ERROR: SHA-1 no registrada o webClientId incorrecto
        return { success: false, error: 'Error de configuración (código 10). Verifica SHA-1 y webClientId.' };
      } else if (error.code === '12501') {
        return { success: false, error: 'Inicio de sesión cancelado por el usuario' };
      }
      return { success: false, error: `Error al iniciar sesión con Google (${error?.code ?? 'desconocido'})` };
    }
  };

  // Sign in with Apple — requerido por App Store (Guideline 4.8)
  const signInWithApple = async () => {
    try {
      // Nonce criptográficamente seguro: 32 bytes aleatorios → hex → SHA-256
      const rawBytes = await Crypto.getRandomBytesAsync(32);
      const rawNonceHex = Array.from(rawBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const nonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonceHex
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
      // No loguear el objeto de error completo (puede contener tokens en desarrollo)
      console.warn('[Auth] Error al cerrar sesión:', e?.message ?? 'error desconocido');
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
