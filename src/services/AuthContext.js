import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';

const AuthContext = createContext(null);

// ─── Trazado centralizado ─────────────────────────────────────────────────────
// TAG identifica el módulo en los logs. Formato: [AUTH][paso] mensaje
const TAG = '[AUTH]';

function trace(step, message, data) {
  const dataStr = data !== undefined ? ` | data: ${JSON.stringify(data)}` : '';
  console.log(`${TAG}[${step}] ${message}${dataStr}`);
}

function traceError(step, message, error) {
  console.error(
    `${TAG}[${step}] ERROR — ${message}`,
    `| code: ${error?.code ?? 'N/A'}`,
    `| message: ${error?.message ?? 'N/A'}`,
    `| name: ${error?.name ?? 'N/A'}`
  );
}

// ─── Catálogo de errores Google Sign-In ──────────────────────────────────────
// Referencia: https://developers.google.com/android/reference/com/google/android/gms/common/api/CommonStatusCodes
const GOOGLE_ERROR_CATALOG = {
  // statusCodes de la librería
  [statusCodes.SIGN_IN_CANCELLED]:           { code: 'SIGN_IN_CANCELLED',          msg: 'El usuario canceló el inicio de sesión.' },
  [statusCodes.IN_PROGRESS]:                 { code: 'IN_PROGRESS',                msg: 'Ya hay un inicio de sesión en curso.' },
  [statusCodes.PLAY_SERVICES_NOT_AVAILABLE]: { code: 'PLAY_SERVICES_NOT_AVAILABLE', msg: 'Google Play Services no está disponible o está desactualizado.' },
  // Códigos numéricos de CommonStatusCodes
  '0':     { code: 'SUCCESS',               msg: 'Operación exitosa (no debería lanzar error).' },
  '4':     { code: 'SIGN_IN_REQUIRED',      msg: 'Se requiere inicio de sesión. El usuario no está autenticado.' },
  '7':     { code: 'NETWORK_ERROR',         msg: 'Error de red. Verifica la conexión a Internet.' },
  '8':     { code: 'INTERNAL_ERROR',        msg: 'Error interno de Google Play Services.' },
  '10':    { code: 'DEVELOPER_ERROR',       msg: 'Error de configuración del desarrollador. Causas: SHA-1 no registrada en Firebase/Google Cloud, webClientId incorrecto o package name no coincide.' },
  '12500': { code: 'SIGN_IN_FAILED',        msg: 'Inicio de sesión fallido por razón no especificada.' },
  '12501': { code: 'SIGN_IN_CANCELLED',     msg: 'El usuario canceló el flujo de inicio de sesión.' },
  '12502': { code: 'SIGN_IN_CURRENTLY_IN_PROGRESS', msg: 'Ya hay un inicio de sesión en progreso.' },
  '13':    { code: 'ERROR',                 msg: 'Error genérico de la API de Google.' },
  '14':    { code: 'INTERRUPTED',           msg: 'Operación interrumpida.' },
  '15':    { code: 'TIMEOUT',               msg: 'Tiempo de espera agotado.' },
  '16':    { code: 'API_NOT_CONNECTED',     msg: 'API de Google no conectada.' },
  '17':    { code: 'CONNECTION_SUSPENDED_DURING_CALL', msg: 'Conexión suspendida durante la llamada.' },
  '18':    { code: 'RECONNECTION_TIMED_OUT_DURING_UPDATE', msg: 'Reconexión agotada durante actualización.' },
  '20':    { code: 'RECONNECTION_TIMED_OUT', msg: 'Tiempo de reconexión agotado.' },
  '21':    { code: 'NOT_INITIALIZED',       msg: 'Google Sign-In no fue inicializado correctamente.' },
};

function resolveGoogleError(error) {
  const key    = String(error?.code ?? '');
  const entry  = GOOGLE_ERROR_CATALOG[key];
  return {
    code:        entry?.code ?? `UNKNOWN_${key}`,
    userMessage: entry?.msg  ?? `Error desconocido (código: ${key || 'sin código'})`,
    rawCode:     key,
    rawMessage:  error?.message ?? '',
  };
}

// ─── Configuración Google Sign-In ─────────────────────────────────────────────
const WEB_CLIENT_ID = Constants.expoConfig?.extra?.googleWebClientId ?? '';

trace('INIT', 'webClientId cargado desde Constants', WEB_CLIENT_ID ? WEB_CLIENT_ID.slice(0, 20) + '...' : '(vacío)');

if (!WEB_CLIENT_ID) {
  console.warn(`${TAG}[INIT] ADVERTENCIA: googleWebClientId no configurado en app.json > extra`);
}

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  offlineAccess: true,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ],
});

trace('INIT', 'GoogleSignin.configure() completado');

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  // ── Restaurar sesión al iniciar ─────────────────────────────────────────────
  const restoreSession = async () => {
    trace('RESTORE', 'Iniciando restauración de sesión');
    try {
      await GoogleSignin.hasPlayServices();
      trace('RESTORE', 'Play Services disponibles');

      const currentUser = await GoogleSignin.getCurrentUser();
      if (currentUser) {
        trace('RESTORE', 'Sesión previa encontrada', { email: currentUser.user?.email });
        const tokens = await GoogleSignin.getTokens();
        setUser({ ...currentUser.user, provider: 'google' });
        setAccessToken(tokens.accessToken);
        trace('RESTORE', 'Sesión restaurada correctamente');
      } else {
        trace('RESTORE', 'No hay sesión previa guardada');
      }
    } catch (error) {
      traceError('RESTORE', 'No se pudo restaurar la sesión', error);
    } finally {
      setLoading(false);
    }
  };

  // ── Google Sign-In ──────────────────────────────────────────────────────────
  const signInWithGoogle = async () => {
    trace('GOOGLE', 'Iniciando flujo de autenticación con Google');
    try {
      trace('GOOGLE', 'Verificando Play Services...');
      await GoogleSignin.hasPlayServices();
      trace('GOOGLE', 'Play Services OK');

      trace('GOOGLE', 'Llamando GoogleSignin.signIn()...');
      const userInfo = await GoogleSignin.signIn();
      trace('GOOGLE', 'signIn() exitoso', { email: userInfo.user?.email });

      trace('GOOGLE', 'Obteniendo tokens...');
      const tokens = await GoogleSignin.getTokens();
      trace('GOOGLE', 'Tokens obtenidos correctamente');

      setUser({ ...userInfo.user, provider: 'google' });
      setAccessToken(tokens.accessToken);
      trace('GOOGLE', 'Usuario autenticado y estado actualizado');

      return { success: true };

    } catch (error) {
      const resolved = resolveGoogleError(error);
      traceError('GOOGLE', `${resolved.code} — ${resolved.userMessage}`, error);

      return {
        success: false,
        code:    resolved.code,
        error:   `[${resolved.rawCode}] ${resolved.userMessage}`,
      };
    }
  };

  // ── Apple Sign-In ───────────────────────────────────────────────────────────
  const signInWithApple = async () => {
    trace('APPLE', 'Iniciando flujo de autenticación con Apple');
    try {
      trace('APPLE', 'Generando nonce criptográfico...');
      const rawBytes    = await Crypto.getRandomBytesAsync(32);
      const rawNonceHex = Array.from(rawBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const nonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonceHex
      );
      trace('APPLE', 'Nonce generado correctamente');

      trace('APPLE', 'Llamando AppleAuthentication.signInAsync()...');
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce,
      });
      trace('APPLE', 'signInAsync() exitoso', { userId: credential.user?.slice(0, 8) + '...' });

      const appleUser = {
        id:       credential.user,
        email:    credential.email,
        name:     credential.fullName?.givenName
          ? `${credential.fullName.givenName} ${credential.fullName.familyName || ''}`.trim()
          : 'Usuario Apple',
        photo:    null,
        provider: 'apple',
      };

      setUser(appleUser);
      setAccessToken(null);
      trace('APPLE', 'Usuario Apple autenticado correctamente');
      return { success: true };

    } catch (error) {
      traceError('APPLE', 'Fallo en Apple Sign-In', error);

      if (error.code === 'ERR_REQUEST_CANCELED') {
        return { success: false, code: 'APPLE_CANCELLED', error: 'Inicio de sesión cancelado' };
      }
      return {
        success: false,
        code:    `APPLE_${error?.code ?? 'UNKNOWN'}`,
        error:   `Error Apple Sign-In [${error?.code ?? 'N/A'}]: ${error?.message ?? 'desconocido'}`,
      };
    }
  };

  // ── Sign-In unificado ───────────────────────────────────────────────────────
  const signIn = (provider = 'google') =>
    provider === 'apple' ? signInWithApple() : signInWithGoogle();

  // ── Sign-Out ────────────────────────────────────────────────────────────────
  const signOut = async () => {
    trace('SIGNOUT', 'Cerrando sesión', { provider: user?.provider });
    try {
      if (user?.provider === 'google') {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      }
      setUser(null);
      setAccessToken(null);
      trace('SIGNOUT', 'Sesión cerrada correctamente');
    } catch (error) {
      traceError('SIGNOUT', 'Error al cerrar sesión', error);
    }
  };

  // ── Renovar token ───────────────────────────────────────────────────────────
  const refreshToken = async () => {
    if (user?.provider !== 'google') return null;
    trace('REFRESH', 'Renovando access token...');
    try {
      await GoogleSignin.clearCachedAccessToken(accessToken);
      const tokens = await GoogleSignin.getTokens();
      setAccessToken(tokens.accessToken);
      trace('REFRESH', 'Token renovado correctamente');
      return tokens.accessToken;
    } catch (error) {
      traceError('REFRESH', 'No se pudo renovar el token', error);
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
