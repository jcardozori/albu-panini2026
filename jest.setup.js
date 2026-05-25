/**
 * @file jest.setup.js
 * @description Configuración global de Jest para el proyecto Laminas WC2026.
 *              Registra mocks de módulos nativos que no pueden ejecutarse en Node.js.
 * @version 1.0.0
 * @date 2026-05-25
 */

// Mock de AsyncStorage — usa el mock manual en __mocks__/@react-native-async-storage/
jest.mock('@react-native-async-storage/async-storage');
