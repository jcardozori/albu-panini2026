/**
 * @file __mocks__/@react-native-async-storage/async-storage.js
 * @description Mock manual de AsyncStorage para pruebas unitarias.
 *              Simula un almacenamiento en memoria con jest.fn() para
 *              poder controlar respuestas con mockResolvedValueOnce/mockRejectedValueOnce.
 * @version 1.0.0
 * @date 2026-05-25
 */

/**
 * Mock de AsyncStorage con todas las funciones como jest.fn().
 * Permite simular éxito, fallo y datos específicos en cada test.
 *
 * @example
 * AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ key: 'value' }));
 * AsyncStorage.setItem.mockRejectedValueOnce(new Error('Disk full'));
 */
const AsyncStorage = {
  /**
   * Obtiene un valor por clave.
   * @type {jest.Mock}
   */
  getItem: jest.fn(),

  /**
   * Guarda un valor por clave.
   * @type {jest.Mock}
   */
  setItem: jest.fn(),

  /**
   * Elimina un valor por clave.
   * @type {jest.Mock}
   */
  removeItem: jest.fn(),

  /**
   * Elimina múltiples claves.
   * @type {jest.Mock}
   */
  multiRemove: jest.fn(),

  /**
   * Limpia todo el almacenamiento.
   * @type {jest.Mock}
   */
  clear: jest.fn(),

  /**
   * Obtiene todas las claves almacenadas.
   * @type {jest.Mock}
   */
  getAllKeys: jest.fn(),
};

module.exports = AsyncStorage;
module.exports.default = AsyncStorage;
