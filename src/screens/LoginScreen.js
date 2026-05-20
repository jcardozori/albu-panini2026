import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Linking,
  Platform,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../services/AuthContext';

function GoogleIcon() {
  return (
    <View style={styles.googleIconContainer}>
      <Text style={styles.googleIconG}>G</Text>
    </View>
  );
}

export default function LoginScreen() {
  const { signIn, isAppleSignInAvailable } = useAuth();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    const result = await signIn('google');
    setLoadingGoogle(false);
    if (!result.success) {
      Alert.alert('Error', result.error || 'No se pudo iniciar sesión');
    }
  };

  const handleAppleLogin = async () => {
    setLoadingApple(true);
    const result = await signIn('apple');
    setLoadingApple(false);
    if (!result.success) {
      Alert.alert('Error', result.error || 'No se pudo iniciar sesión con Apple');
    }
  };

  const isLoading = loadingGoogle || loadingApple;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <View style={styles.container}>
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>⚽</Text>
            </View>
          </View>

          <Text style={styles.appName}>Laminas WC2026</Text>
          <Text style={styles.appSubtitle}>FIFA World Cup</Text>

          <View style={styles.divider} />

          <Text style={styles.welcomeText}>Inicia sesión para continuar</Text>
          <Text style={styles.descText}>
            Gestiona tus fichas del álbum del Mundial 2026 y sincroniza tu progreso con Google Sheets.
          </Text>

          {/* Botón Google */}
          <TouchableOpacity
            style={[styles.googleButton, isLoading && styles.buttonDisabled]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {loadingGoogle ? (
              <ActivityIndicator size="small" color="#4285F4" />
            ) : (
              <>
                <GoogleIcon />
                <Text style={styles.googleButtonText}>Continuar con Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Botón Apple — solo en iOS, requerido por App Store Guideline 4.8 */}
          {isAppleSignInAvailable && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={12}
              style={[styles.appleButton, isLoading && styles.buttonDisabled]}
              onPress={handleAppleLogin}
            />
          )}

          <Text style={styles.legalText}>
            Al continuar, aceptas los{' '}
            <Text
              style={styles.legalLink}
              onPress={() => Linking.openURL('https://jcardozori.github.io/albu-panini2026/privacy')}
            >
              Términos de Servicio y Política de Privacidad
            </Text>
          </Text>
        </View>

        <Text style={styles.footerText}>Laminas WC2026 · Tracker</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  bgCircle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#16213e',
    opacity: 0.8,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#0f3460',
    opacity: 0.6,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 36,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 40,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a2e',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 15,
    color: '#4285F4',
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 2,
  },
  divider: {
    width: 40,
    height: 3,
    backgroundColor: '#4285F4',
    borderRadius: 2,
    marginVertical: 20,
  },
  welcomeText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  descText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  appleButton: {
    width: '100%',
    height: 50,
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconG: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  legalText: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 16,
    textAlign: 'center',
  },
  legalLink: {
    color: '#4285F4',
  },
  footerText: {
    color: '#4b5563',
    fontSize: 12,
    marginTop: 32,
  },
});
