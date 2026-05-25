/**
 * @file __mocks__/expo-constants.js
 * @description Mock de expo-constants para pruebas unitarias.
 *              Simula las variables de entorno inyectadas por EAS en tiempo de build.
 * @version 1.0.0
 * @date 2026-05-25
 */

const Constants = {
  expoConfig: {
    extra: {
      googleWebClientId: 'mock-web-client-id.apps.googleusercontent.com',
      admobBannerAndroid: 'ca-app-pub-test/banner',
      admobInterstitialAndroid: 'ca-app-pub-test/interstitial',
    },
  },
};

module.exports = Constants;
module.exports.default = Constants;
