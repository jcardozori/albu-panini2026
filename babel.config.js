/**
 * @file babel.config.js
 * @description Configuración de Babel para el proyecto Laminas WC2026.
 *              Usa el preset de Expo para compatibilidad con React Native y Jest.
 * @version 1.0.0
 * @date 2026-05-25
 */

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
