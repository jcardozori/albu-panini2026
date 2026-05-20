// App.js — Punto de entrada principal
import React, { useEffect } from 'react';
import { AuthProvider } from './src/services/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { initAds, preloadInterstitial } from './src/services/AdService';

export default function App() {
  useEffect(() => {
    // Inicializar AdMob y pre-cargar el primer intersticial al arrancar
    initAds().then(() => preloadInterstitial());
  }, []);

  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
