/**
 * @file __mocks__/expo-apple-authentication.js
 * @description Mock de expo-apple-authentication para pruebas unitarias.
 *              Simula los flujos de éxito y cancelación de Apple Sign-In.
 * @version 1.0.0
 * @date 2026-05-25
 */

/** @enum {string} Scopes de autenticación de Apple */
const AppleAuthenticationScope = {
  FULL_NAME: 'fullName',
  EMAIL: 'email',
};

/** @enum {string} Tipos de botón de Apple Sign-In */
const AppleAuthenticationButtonType = {
  SIGN_IN: 'signIn',
  CONTINUE: 'continue',
};

/** @enum {string} Estilos de botón de Apple Sign-In */
const AppleAuthenticationButtonStyle = {
  BLACK: 'black',
  WHITE: 'white',
  WHITE_OUTLINE: 'whiteOutline',
};

/**
 * Inicia el flujo de autenticación con Apple (mock).
 * Por defecto devuelve credenciales simuladas de éxito.
 *
 * @param {object} options - Opciones de autenticación.
 * @param {string[]} options.requestedScopes - Scopes solicitados.
 * @param {string} options.nonce - Nonce criptográfico para anti-replay.
 * @returns {Promise<object>} Credenciales de usuario simuladas.
 *
 * @example
 * const credential = await signInAsync({ requestedScopes: ['email'], nonce: 'abc' });
 */
const signInAsync = jest.fn(async (options) => ({
  user: 'mock-apple-user-id-12345',
  email: 'test@privaterelay.appleid.com',
  fullName: { givenName: 'Juan', familyName: 'Pérez' },
  identityToken: 'mock-identity-token',
  authorizationCode: 'mock-auth-code',
}));

/**
 * Componente de botón de Apple Sign-In (mock como función vacía).
 *
 * @returns {null} No renderiza nada en entorno de test.
 */
const AppleAuthenticationButton = jest.fn(() => null);

module.exports = {
  AppleAuthenticationScope,
  AppleAuthenticationButtonType,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationButton,
  signInAsync,
};
