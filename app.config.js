// app.config.js — reemplaza app.json para poder usar process.env en campos de config
// EAS Build inyecta GOOGLE_SERVICES_JSON como ruta al archivo antes del Prebuild.
// Localmente, si no existe la variable, cae al archivo del repositorio.

const base = require('./app.json');

module.exports = ({ config }) => ({
  ...base.expo,
  android: {
    ...base.expo.android,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
  },
});
