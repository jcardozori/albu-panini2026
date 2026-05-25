/**
 * @file __mocks__/expo-crypto.js
 * @description Mock de expo-crypto para pruebas unitarias.
 *              Simula la generación de bytes aleatorios y el digest SHA-256
 *              usados en el flujo de Apple Sign-In.
 * @version 1.0.0
 * @date 2026-05-25
 */

/** @enum {string} Algoritmos de digest disponibles (subconjunto usado en la app) */
const CryptoDigestAlgorithm = {
  SHA256: 'SHA-256',
};

/**
 * Genera un array de bytes aleatorios (mock determinístico para tests).
 *
 * @param {number} byteCount - Número de bytes a generar.
 * @returns {Promise<Uint8Array>} Array de bytes con valores 0x00–0xFF.
 *
 * @example
 * const bytes = await getRandomBytesAsync(32);
 * // bytes.length === 32
 */
const getRandomBytesAsync = jest.fn(async (byteCount) => {
  return new Uint8Array(byteCount).fill(0xab);
});

/**
 * Calcula el digest de una cadena (mock: devuelve hash fijo para tests).
 *
 * @param {string} algorithm - Algoritmo de hash (ej. CryptoDigestAlgorithm.SHA256).
 * @param {string} data - Cadena a hashear.
 * @returns {Promise<string>} Hash hexadecimal simulado.
 *
 * @example
 * const hash = await digestStringAsync(CryptoDigestAlgorithm.SHA256, 'test');
 * // hash === 'mock-sha256-hash'
 */
const digestStringAsync = jest.fn(async (algorithm, data) => {
  return 'mock-sha256-hash';
});

module.exports = { CryptoDigestAlgorithm, getRandomBytesAsync, digestStringAsync };
