// src/services/AdService.js
// Gestión centralizada de AdMob: inicialización, IDs y intersticial.
//
// IDs de PRODUCCIÓN → crear en console.admob.google.com > Aplicaciones > Unidades de anuncio
// IDs de PRUEBA      → los de Google, sólo para desarrollo local o emulador.
//
// Cómo agregar los IDs reales:
//   1. Crea una unidad de anuncio tipo "Banner" y otra tipo "Intersticial" en AdMob.
//   2. Sustituye las constantes PROD_* de abajo con los IDs obtenidos.
//   3. Agrega ADMOB_APP_ID_ANDROID a los secrets de EAS (igual que GOOGLE_SERVICES_JSON).

import {
  InterstitialAd,
  AdEventType,
  TestIds,
  MobileAds,
} from 'react-native-google-mobile-ads';

// ─── IDs de prueba (Google oficiales) ────────────────────────────────────────
const TEST_BANNER_ID        = TestIds.ADAPTIVE_BANNER;
const TEST_INTERSTITIAL_ID  = TestIds.INTERSTITIAL;

// ─── IDs de producción — reemplaza con los tuyos de AdMob ────────────────────
const PROD_BANNER_ID        = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'; // TODO
const PROD_INTERSTITIAL_ID  = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX'; // TODO

// ─── Selección automática según entorno ──────────────────────────────────────
const IS_PROD = !__DEV__;

export const BANNER_AD_UNIT_ID       = IS_PROD ? PROD_BANNER_ID       : TEST_BANNER_ID;
export const INTERSTITIAL_AD_UNIT_ID = IS_PROD ? PROD_INTERSTITIAL_ID : TEST_INTERSTITIAL_ID;

// ─── Inicialización (llamar una sola vez al arrancar la app) ─────────────────
let _initialized = false;

export async function initAds() {
  if (_initialized) return;
  try {
    await MobileAds().initialize();
    _initialized = true;
  } catch (e) {
    // No bloquear el flujo si los anuncios fallan al inicializar
  }
}

// ─── Intersticial ─────────────────────────────────────────────────────────────
// Muestra un intersticial y ejecuta onClosed al cerrarlo.
// Si no está listo, ejecuta onClosed de inmediato para no bloquear la navegación.
let _interstitial = null;
let _interstitialLoaded = false;

export function preloadInterstitial() {
  _interstitialLoaded = false;
  _interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
    requestNonPersonalizedAdsOnly: false,
  });

  const unsubscribeLoaded = _interstitial.addAdEventListener(AdEventType.LOADED, () => {
    _interstitialLoaded = true;
    unsubscribeLoaded();
  });

  const unsubscribeError = _interstitial.addAdEventListener(AdEventType.ERROR, () => {
    _interstitialLoaded = false;
    unsubscribeError();
  });

  _interstitial.load();
}

export function showInterstitial(onClosed) {
  if (!_interstitialLoaded || !_interstitial) {
    onClosed?.();
    preloadInterstitial(); // pre-cargar el siguiente
    return;
  }

  const unsubscribeClosed = _interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    unsubscribeClosed();
    onClosed?.();
    preloadInterstitial(); // pre-cargar el siguiente inmediatamente
  });

  try {
    _interstitial.show();
    _interstitialLoaded = false;
  } catch {
    onClosed?.();
    preloadInterstitial();
  }
}
