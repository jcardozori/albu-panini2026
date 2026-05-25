// src/components/AdBanner.js
// Banner adaptivo fijo en la parte inferior de la pantalla.
// Respeta la barra de navegación/gestos del sistema (safe area).
// Se oculta automáticamente si el anuncio falla al cargar.

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { BANNER_AD_UNIT_ID } from '../services/AdService';

export default function AdBanner() {
  const [visible, setVisible] = useState(true);
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
        onAdLoaded={() => setVisible(true)}
        onAdFailedToLoad={() => setVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
});
