/**
 * @file src/__tests__/StorageService.test.js
 * @description Pruebas unitarias para StorageService — capa de persistencia local
 *              basada en AsyncStorage. Cubre carga, guardado y manejo de errores.
 * @module StorageService.test
 * @version 1.0.0
 * @date 2026-05-25
 * @dependencies jest, @react-native-async-storage/async-storage (mock)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadLocalData, saveLocalData } from '../services/StorageService';

// ─── Setup ────────────────────────────────────────────────────────────────────

/**
 * Limpia todos los mocks antes de cada prueba para evitar
 * contaminación entre tests.
 */
beforeEach(() => {
  jest.clearAllMocks();
});

// ─── loadLocalData ─────────────────────────────────────────────────────────────

describe('loadLocalData', () => {
  /**
   * Verifica que retorna null cuando no existe ningún dato guardado.
   * Caso: primera instalación del app, sin datos previos.
   */
  it('retorna null cuando no hay datos guardados', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);

    const result = await loadLocalData();

    expect(result).toBeNull();
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('@album_sticker_states_v1');
  });

  /**
   * Verifica que deserializa y retorna correctamente los datos guardados.
   * Caso: usuario regresa a la app después de haber marcado fichas.
   */
  it('retorna los datos parseados cuando existen en storage', async () => {
    const mockData = {
      fwc_1_8: { 0: true, 1: false, 2: true },
      grupo_a_mexico: { 0: false, 1: false },
    };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockData));

    const result = await loadLocalData();

    expect(result).toEqual(mockData);
  });

  /**
   * Verifica que retorna null si el JSON almacenado está corrupto.
   * Caso: error de escritura parcial en el dispositivo.
   */
  it('retorna null si el JSON guardado es inválido', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce('{ corrupto: sin_comillas }');

    const result = await loadLocalData();

    expect(result).toBeNull();
  });

  /**
   * Verifica que retorna null y no lanza excepción si AsyncStorage falla.
   * Caso: dispositivo sin espacio, storage bloqueado.
   */
  it('retorna null y no lanza si AsyncStorage lanza error', async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage not available'));

    const result = await loadLocalData();

    expect(result).toBeNull();
  });

  /**
   * Verifica que preserva la estructura anidada completa de los datos.
   * Caso: álbum con todas las secciones marcadas.
   */
  it('preserva la estructura anidada de secciones y fichas', async () => {
    const mockData = {
      fwc_1_8: { 0: true, 1: true, 2: false, 3: true },
      grupo_j_colombia: { 0: false, 1: true, 2: true },
    };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockData));

    const result = await loadLocalData();

    expect(result.fwc_1_8[0]).toBe(true);
    expect(result.fwc_1_8[2]).toBe(false);
    expect(result.grupo_j_colombia[1]).toBe(true);
  });
});

// ─── saveLocalData ─────────────────────────────────────────────────────────────

describe('saveLocalData', () => {
  /**
   * Verifica que guarda los datos serializados en la clave correcta.
   * Caso: usuario marca una ficha y la app auto-guarda.
   */
  it('guarda los datos correctamente y retorna true', async () => {
    AsyncStorage.setItem.mockResolvedValueOnce(undefined);
    const data = { fwc_1_8: { 0: true, 1: false } };

    const result = await saveLocalData(data);

    expect(result).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@album_sticker_states_v1',
      JSON.stringify(data)
    );
  });

  /**
   * Verifica que retorna false y no lanza si AsyncStorage falla.
   * Caso: dispositivo sin espacio de almacenamiento disponible.
   */
  it('retorna false y no lanza si AsyncStorage falla al guardar', async () => {
    AsyncStorage.setItem.mockRejectedValueOnce(new Error('Disk full'));
    const data = { fwc_1_8: { 0: true } };

    const result = await saveLocalData(data);

    expect(result).toBe(false);
  });

  /**
   * Verifica que serializa correctamente objetos complejos con booleanos.
   * Caso: estado mixto con fichas marcadas y sin marcar.
   */
  it('serializa correctamente booleanos true y false', async () => {
    AsyncStorage.setItem.mockResolvedValueOnce(undefined);
    const data = {
      fwc_1_8: { 0: true, 1: false, 2: true, 3: false },
    };

    await saveLocalData(data);

    const [[, savedJson]] = AsyncStorage.setItem.mock.calls;
    const parsed = JSON.parse(savedJson);
    expect(parsed.fwc_1_8[0]).toBe(true);
    expect(parsed.fwc_1_8[1]).toBe(false);
  });

  /**
   * Verifica que puede guardar un objeto vacío (estado de reset).
   * Caso: usuario limpia todo el álbum.
   */
  it('guarda un objeto vacío correctamente', async () => {
    AsyncStorage.setItem.mockResolvedValueOnce(undefined);

    const result = await saveLocalData({});

    expect(result).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@album_sticker_states_v1',
      '{}'
    );
  });

  /**
   * Ciclo completo: guarda datos y los recarga para verificar consistencia.
   * Caso: flujo real de marcar ficha → cerrar app → reabrir.
   */
  it('ciclo completo: guardar y recuperar produce los mismos datos', async () => {
    const original = {
      fwc_1_8: { 0: true, 1: false, 2: true },
      grupo_j_colombia: { 0: false, 1: true },
    };
    const serialized = JSON.stringify(original);

    AsyncStorage.setItem.mockResolvedValueOnce(undefined);
    AsyncStorage.getItem.mockResolvedValueOnce(serialized);

    await saveLocalData(original);
    const recovered = await loadLocalData();

    expect(recovered).toEqual(original);
  });
});
