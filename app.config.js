// app.config.js — reemplaza app.json para poder usar process.env en campos de config
//
// Variables de entorno gestionadas en EAS (nunca en texto plano en el repo):
//   GOOGLE_SERVICES_JSON         → archivo google-services.json (file secret)
//   GOOGLE_WEB_CLIENT_ID         → OAuth 2.0 web client ID de Google Sign-In
//   ADMOB_APP_ID_ANDROID         → ID de la app en AdMob (ca-app-pub-XXXX~YYYY)
//   ADMOB_APP_ID_IOS             → ID de la app en AdMob iOS
//   ADMOB_BANNER_ANDROID         → Unidad de anuncio Banner (ca-app-pub-XXXX/YYYY)
//   ADMOB_INTERSTITIAL_ANDROID   → Unidad de anuncio Intersticial
//
// En desarrollo local caen a IDs de prueba oficiales de Google.

const base = require('./app.json');

// App IDs de prueba oficiales de Google (solo para emulador/desarrollo)
const TEST_ADMOB_ANDROID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_ADMOB_IOS     = 'ca-app-pub-3940256099942544~1458002511';

module.exports = ({ config }) => ({
  ...base.expo,
  android: {
    ...base.expo.android,
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
  },
  extra: {
    ...base.expo.extra,
    // Claves sensibles inyectadas por EAS en tiempo de build
    googleWebClientId:          process.env.GOOGLE_WEB_CLIENT_ID,
    admobBannerAndroid:         process.env.ADMOB_BANNER_ANDROID,
    admobInterstitialAndroid:   process.env.ADMOB_INTERSTITIAL_ANDROID,
  },
  plugins: [
    ...(base.expo.plugins ?? []),
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: process.env.ADMOB_APP_ID_ANDROID ?? TEST_ADMOB_ANDROID,
        iosAppId:     process.env.ADMOB_APP_ID_IOS     ?? TEST_ADMOB_IOS,
        userTrackingUsageDescription:
          'Esta app muestra publicidad relevante. Tu información no es compartida con SiTechNi.',
        skAdNetworkItems: [],
      },
    ],
  ],
});
