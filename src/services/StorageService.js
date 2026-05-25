// src/services/StorageService.js
// Persistencia local con AsyncStorage — sin red, sin OAuth, instantáneo.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@album_sticker_states_v1';

/**
 * Carga el estado de las fichas desde el almacenamiento local.
 * Retorna null si no hay datos guardados.
 */
export async function loadLocalData() {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    return JSON.parse(json);
  } catch (e) {
    console.error('[Storage] Error cargando datos locales:', e);
    return null;
  }
}

/**
 * Guarda el estado completo de las fichas en el almacenamiento local.
 * Retorna true si fue exitoso, false si falló.
 */
export async function saveLocalData(allStates) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allStates));
    return true;
  } catch (e) {
    console.error('[Storage] Error guardando datos locales:', e);
    return false;
  }
}
