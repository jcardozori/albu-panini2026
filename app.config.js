// app.config.js — reemplaza app.json para poder usar process.env en campos de config
// EAS Build inyecta variables de entorno antes del Prebuild:
//   GOOGLE_SERVICES_JSON  → ruta al google-services.json
//   ADMOB_APP_ID_ANDROID  → ca-app-pub-XXXXXX~XXXXXX  (ID de la app en AdMob)
//   ADMOB_APP_ID_IOS      → ca-app-pub-XXXXXX~XXXXXX  (ID de la app en AdMob iOS)
// Localmente caen a los IDs de prueba de Google.

const base = require('./app.json');

// IDs de prueba oficiales de Google (sólo para desarrollo/emulador)
const TEST_ADMOB_ANDROID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_ADMOB_IOS     = 'ca-app-pub-3940256099942544~1458002511';

module.exports = ({ config }) => ({
  ...base.expo,
  android: {
    ...base.expo.android,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
  },
  plugins: [
    ...(base.expo.plugins ?? []),
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: process.env.ADMOB_APP_ID_ANDROID ?? TEST_ADMOB_ANDROID,
        iosAppId:     process.env.ADMOB_APP_ID_IOS     ?? TEST_ADMOB_IOS,
        // Declara que los anuncios pueden contener contenido para mayores de 13 años
        userTrackingUsageDescription:
          'Esta app muestra publicidad relevante. Tu información no es compartida con SiTechNi.',
        skAdNetworkItems: [],
      },
    ],
  ],
});
