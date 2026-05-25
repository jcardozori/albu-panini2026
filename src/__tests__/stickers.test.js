/**
 * @file src/__tests__/stickers.test.js
 * @description Pruebas unitarias para el módulo de datos del álbum.
 *              Cubre generación de etiquetas, estado inicial y detección de completitud.
 * @module stickers.test
 * @version 1.0.0
 * @date 2026-05-25
 * @dependencies jest
 */

import {
  SECTIONS,
  getStickerLabel,
  getInitialStickerState,
  isSectionComplete,
} from '../data/stickers';

// ─── getStickerLabel ───────────────────────────────────────────────────────────

describe('getStickerLabel', () => {
  /**
   * Verifica que la primera ficha de FWC sea "00" (labels array personalizado).
   * Caso crítico: fue el bug reportado por el usuario.
   */
  it('retorna "00" para la primera ficha de la sección FWC con labels[]', () => {
    const fwcSection = SECTIONS.find(s => s.id === 'fwc_1_8');
    expect(getStickerLabel(fwcSection, 0)).toBe('00');
  });

  /**
   * Verifica la secuencia completa de etiquetas de la sección FWC (00-8).
   */
  it('retorna la secuencia correcta 00,1,2,...,8 para la sección FWC', () => {
    const fwcSection = SECTIONS.find(s => s.id === 'fwc_1_8');
    const expected = ['00', '1', '2', '3', '4', '5', '6', '7', '8'];
    expected.forEach((label, index) => {
      expect(getStickerLabel(fwcSection, index)).toBe(label);
    });
  });

  /**
   * Verifica que las fichas CocaCola usen el prefijo "CC" correctamente.
   */
  it('retorna etiqueta con prefijo "CC" para sección CocaCola', () => {
    const ccSection = SECTIONS.find(s => s.id === 'fichas_cocacola');
    expect(getStickerLabel(ccSection, 0)).toBe('CC1');
    expect(getStickerLabel(ccSection, 13)).toBe('CC14');
  });

  /**
   * Verifica que las secciones de grupos usen números secuenciales desde 1.
   * Caso: sección sin labels[], sin prefix, sin startNumber explícito.
   */
  it('retorna índice + 1 para secciones sin configuración especial', () => {
    const colombiaSection = SECTIONS.find(s => s.id === 'grupo_k_colombia');
    expect(getStickerLabel(colombiaSection, 0)).toBe('1');
    expect(getStickerLabel(colombiaSection, 9)).toBe('10');
    expect(getStickerLabel(colombiaSection, 19)).toBe('20');
  });

  /**
   * Verifica que secciones con startNumber numérico los usen como base.
   */
  it('retorna número correcto para la sección FWC 9-19 con startNumber=9', () => {
    const fwc919 = SECTIONS.find(s => s.id === 'fwc_9_19');
    expect(getStickerLabel(fwc919, 0)).toBe('9');
    expect(getStickerLabel(fwc919, 10)).toBe('19');
  });

  /**
   * Verifica que labels[] con índice fuera de rango retorna el índice como string.
   */
  it('retorna el índice como fallback si labels[] no tiene ese índice', () => {
    const sectionConLabels = { labels: ['00', '1'], totalStickers: 3 };
    expect(getStickerLabel(sectionConLabels, 5)).toBe('5');
  });
});

// ─── getInitialStickerState ────────────────────────────────────────────────────

describe('getInitialStickerState', () => {
  /**
   * Verifica que el estado inicial tiene el número correcto de fichas.
   */
  it('crea un estado con el total de fichas de la sección', () => {
    const section = { id: 'test', totalStickers: 20 };
    const state = getInitialStickerState(section);
    expect(Object.keys(state)).toHaveLength(20);
  });

  /**
   * Verifica que todas las fichas arrancan en false (no marcadas).
   */
  it('inicializa todas las fichas en false', () => {
    const section = { id: 'test', totalStickers: 5 };
    const state = getInitialStickerState(section);
    Object.values(state).forEach(val => {
      expect(val).toBe(false);
    });
  });

  /**
   * Verifica que las claves son índices numéricos consecutivos desde 0.
   */
  it('usa índices numéricos consecutivos como claves', () => {
    const section = { id: 'test', totalStickers: 3 };
    const state = getInitialStickerState(section);
    expect(Object.keys(state)).toEqual(['0', '1', '2']);
  });

  /**
   * Verifica que funciona con 0 fichas sin lanzar error.
   */
  it('crea objeto vacío para sección con 0 fichas', () => {
    const section = { id: 'empty', totalStickers: 0 };
    const state = getInitialStickerState(section);
    expect(state).toEqual({});
  });
});

// ─── isSectionComplete ─────────────────────────────────────────────────────────

describe('isSectionComplete', () => {
  /**
   * Verifica que retorna true cuando todas las fichas están en true.
   * Caso: sección completada — debe mostrar ✅ y fondo verde.
   */
  it('retorna true cuando todas las fichas están marcadas', () => {
    const state = { 0: true, 1: true, 2: true, 3: true };
    expect(isSectionComplete(state)).toBe(true);
  });

  /**
   * Verifica que retorna false cuando al menos una ficha falta.
   */
  it('retorna false cuando hay al menos una ficha sin marcar', () => {
    const state = { 0: true, 1: true, 2: false, 3: true };
    expect(isSectionComplete(state)).toBe(false);
  });

  /**
   * Verifica que retorna false cuando ninguna ficha está marcada.
   */
  it('retorna false cuando ninguna ficha está marcada', () => {
    const state = { 0: false, 1: false, 2: false };
    expect(isSectionComplete(state)).toBe(false);
  });

  /**
   * Verifica que retorna false con null — protección contra estados no iniciados.
   */
  it('retorna false con null sin lanzar error', () => {
    expect(isSectionComplete(null)).toBe(false);
  });

  /**
   * Verifica que retorna false con undefined.
   */
  it('retorna false con undefined sin lanzar error', () => {
    expect(isSectionComplete(undefined)).toBe(false);
  });

  /**
   * Verifica comportamiento con objeto vacío (sección sin fichas).
   * every([]) retorna true por vacío-verdadero, pero es un caso borde.
   */
  it('retorna true para objeto vacío (vacío-verdadero de every)', () => {
    expect(isSectionComplete({})).toBe(true);
  });
});

// ─── SECTIONS (integridad del catálogo) ──────────────────────────────────────

describe('SECTIONS — integridad del catálogo', () => {
  /**
   * Verifica que el catálogo tiene secciones definidas.
   */
  it('contiene al menos una sección', () => {
    expect(SECTIONS.length).toBeGreaterThan(0);
  });

  /**
   * Verifica que todos los IDs de sección son únicos.
   */
  it('todos los IDs de sección son únicos', () => {
    const ids = SECTIONS.map(s => s.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  /**
   * Verifica que cada sección tiene los campos obligatorios.
   */
  it('cada sección tiene id, title y totalStickers', () => {
    SECTIONS.forEach(section => {
      expect(section).toHaveProperty('id');
      expect(section).toHaveProperty('title');
      expect(section).toHaveProperty('totalStickers');
      expect(typeof section.id).toBe('string');
      expect(typeof section.title).toBe('string');
      expect(typeof section.totalStickers).toBe('number');
      expect(section.totalStickers).toBeGreaterThan(0);
    });
  });

  /**
   * Verifica que la sección FWC tiene 9 fichas (00-8 inclusive).
   */
  it('la sección FWC tiene 9 fichas (00 hasta 8)', () => {
    const fwc = SECTIONS.find(s => s.id === 'fwc_1_8');
    expect(fwc).toBeDefined();
    expect(fwc.totalStickers).toBe(9);
    expect(fwc.labels).toHaveLength(9);
    expect(fwc.labels[0]).toBe('00');
  });

  /**
   * Verifica que la sección CocaCola tiene 14 fichas.
   */
  it('la sección CocaCola tiene 14 fichas (CC1-CC14)', () => {
    const cc = SECTIONS.find(s => s.id === 'fichas_cocacola');
    expect(cc).toBeDefined();
    expect(cc.totalStickers).toBe(14);
    expect(cc.prefix).toBe('CC');
  });
});
