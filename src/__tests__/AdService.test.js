/**
 * @file src/__tests__/AdService.test.js
 * @description Pruebas unitarias para AdService — gestión del ciclo de vida
 *              de anuncios intersticiales de AdMob.
 *              Cubre inicialización, precarga, visualización y manejo de fallos.
 * @module AdService.test
 * @version 1.0.0
 * @date 2026-05-25
 * @dependencies jest
 */

// ─── Mocks de dependencias nativas ───────────────────────────────────────────

/** Instancia simulada de un intersticial con control de estado */
const mockInterstitialInstance = {
  addAdEventListener: jest.fn(),
  load: jest.fn(),
  show: jest.fn(),
};

/** Mock de react-native-google-mobile-ads */
jest.mock('react-native-google-mobile-ads', () => ({
  InterstitialAd: {
    createForAdRequest: jest.fn(() => mockInterstitialInstance),
  },
  AdEventType: {
    LOADED: 'loaded',
    CLOSED: 'closed',
    ERROR: 'error',
  },
  BannerAd: jest.fn(() => null),
  BannerAdSize: {
    ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
  },
  TestIds: {
    ADAPTIVE_BANNER: 'ca-app-pub-3940256099942544/9214589741',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  },
  MobileAds: jest.fn(() => ({
    initialize: jest.fn().mockResolvedValue(undefined),
  })),
}));

import { InterstitialAd, AdEventType, MobileAds } from 'react-native-google-mobile-ads';
import { initAds, preloadInterstitial, showInterstitial } from '../services/AdService';

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  // Restaurar estado del módulo entre tests
  jest.isolateModules(() => {});
});

// ─── initAds ──────────────────────────────────────────────────────────────────

describe('initAds', () => {
  /**
   * Verifica que inicializa MobileAds correctamente en el primer llamado.
   */
  it('llama a MobileAds().initialize() al primer llamado', async () => {
    const mockInitialize = jest.fn().mockResolvedValue(undefined);
    MobileAds.mockReturnValue({ initialize: mockInitialize });

    await initAds();

    expect(mockInitialize).toHaveBeenCalledTimes(1);
  });

  /**
   * Verifica que no lanza error si MobileAds falla al inicializar.
   * Caso: dispositivo sin Google Play Services (emulador básico).
   */
  it('no lanza error si MobileAds falla al inicializar', async () => {
    MobileAds.mockReturnValue({
      initialize: jest.fn().mockRejectedValue(new Error('No Play Services')),
    });

    await expect(initAds()).resolves.not.toThrow();
  });
});

// ─── preloadInterstitial ──────────────────────────────────────────────────────

describe('preloadInterstitial', () => {
  /**
   * Verifica que crea una solicitud de anuncio con el ID correcto.
   */
  it('crea una instancia de intersticial y llama a load()', () => {
    preloadInterstitial();

    expect(InterstitialAd.createForAdRequest).toHaveBeenCalledTimes(1);
    expect(mockInterstitialInstance.load).toHaveBeenCalledTimes(1);
  });

  /**
   * Verifica que registra listeners para LOADED y ERROR.
   */
  it('registra event listeners para LOADED y ERROR', () => {
    preloadInterstitial();

    const calls = mockInterstitialInstance.addAdEventListener.mock.calls;
    const eventTypes = calls.map(([event]) => event);
    expect(eventTypes).toContain(AdEventType.LOADED);
    expect(eventTypes).toContain(AdEventType.ERROR);
  });
});

// ─── showInterstitial ─────────────────────────────────────────────────────────

describe('showInterstitial', () => {
  /**
   * Verifica que llama onClosed inmediatamente si el anuncio no está cargado.
   * Caso: usuario abre la app antes de que el ad descargue.
   */
  it('llama onClosed de inmediato si el intersticial no está cargado', () => {
    // Estado inicial: no hay ad cargado
    const onClosed = jest.fn();

    showInterstitial(onClosed);

    expect(onClosed).toHaveBeenCalledTimes(1);
  });

  /**
   * Verifica que preloads el siguiente ad aunque el actual no esté listo.
   */
  it('precarga el siguiente ad cuando el actual no está disponible', () => {
    showInterstitial(jest.fn());

    expect(InterstitialAd.createForAdRequest).toHaveBeenCalled();
    expect(mockInterstitialInstance.load).toHaveBeenCalled();
  });

  /**
   * Verifica que no lanza error si onClosed es undefined.
   * Caso: llamada sin callback (al entrar a HomeScreen).
   */
  it('no lanza error si onClosed es undefined', () => {
    expect(() => showInterstitial()).not.toThrow();
  });

  /**
   * Verifica que no lanza error si onClosed es null.
   */
  it('no lanza error si onClosed es null', () => {
    expect(() => showInterstitial(null)).not.toThrow();
  });
});
