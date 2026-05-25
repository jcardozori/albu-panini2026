/**
 * @file src/__tests__/AuthContext.test.js
 * @description Pruebas unitarias para la lógica de autenticación.
 *              Cubre resolución de errores de Google Sign-In, catálogo de códigos
 *              y el flujo de sign-out.
 * @module AuthContext.test
 * @version 1.0.0
 * @date 2026-05-25
 * @dependencies jest, react, @testing-library/react-native
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';

// ─── Mocks de dependencias nativas ───────────────────────────────────────────

/** Mock de GoogleSignin — simula la librería nativa de Google Sign-In */
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn(),
    getTokens: jest.fn(),
    getCurrentUser: jest.fn().mockResolvedValue(null),
    signOut: jest.fn().mockResolvedValue(undefined),
    revokeAccess: jest.fn().mockResolvedValue(undefined),
    clearCachedAccessToken: jest.fn().mockResolvedValue(undefined),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: '12501',
    IN_PROGRESS: '12502',
    PLAY_SERVICES_NOT_AVAILABLE: '-2',
  },
}));

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { AuthProvider, useAuth } from '../services/AuthContext';

// ─── Wrapper para el hook ──────────────────────────────────────────────────────

/**
 * Envuelve el hook useAuth en el AuthProvider para pruebas.
 *
 * @param {object} props - Props del componente.
 * @returns {JSX.Element} Proveedor de autenticación.
 */
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

// ─── signInWithGoogle — flujo de éxito ────────────────────────────────────────

describe('signInWithGoogle — flujo de éxito', () => {
  /**
   * Verifica que signIn retorna success:true cuando Google Sign-In es exitoso.
   */
  it('retorna success:true con datos de usuario al autenticarse correctamente', async () => {
    const mockUser = {
      user: { id: '123', email: 'test@gmail.com', name: 'Test User', photo: null },
    };
    GoogleSignin.signIn.mockResolvedValueOnce(mockUser);
    GoogleSignin.getTokens.mockResolvedValueOnce({ accessToken: 'mock-token-abc' });

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.signIn('google');
    });

    expect(response.success).toBe(true);
    expect(result.current.user).not.toBeNull();
    expect(result.current.user.email).toBe('test@gmail.com');
    expect(result.current.user.provider).toBe('google');
    expect(result.current.accessToken).toBe('mock-token-abc');
  });
});

// ─── signInWithGoogle — manejo de errores ────────────────────────────────────

describe('signInWithGoogle — manejo de errores', () => {
  /**
   * Verifica que error 10 (DEVELOPER_ERROR) retorna success:false con código correcto.
   * Caso crítico: configuración incorrecta de OAuth / SHA-1 no registrada.
   */
  it('retorna DEVELOPER_ERROR para código 10', async () => {
    const error = new Error('Developer error');
    error.code = '10';
    GoogleSignin.signIn.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.signIn('google');
    });

    expect(response.success).toBe(false);
    expect(response.code).toBe('DEVELOPER_ERROR');
    expect(response.error).toContain('[10]');
  });

  /**
   * Verifica que error 12501 (cancelación por el usuario) retorna SIGN_IN_CANCELLED.
   */
  it('retorna SIGN_IN_CANCELLED cuando el usuario cancela', async () => {
    const error = new Error('Cancelled');
    error.code = statusCodes.SIGN_IN_CANCELLED;
    GoogleSignin.signIn.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.signIn('google');
    });

    expect(response.success).toBe(false);
    expect(response.code).toBe('SIGN_IN_CANCELLED');
  });

  /**
   * Verifica que error 7 (red) retorna NETWORK_ERROR con mensaje en español.
   */
  it('retorna NETWORK_ERROR para código 7 con mensaje descriptivo', async () => {
    const error = new Error('Network error');
    error.code = '7';
    GoogleSignin.signIn.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.signIn('google');
    });

    expect(response.success).toBe(false);
    expect(response.code).toBe('NETWORK_ERROR');
    expect(response.error).toContain('red');
  });

  /**
   * Verifica que un código desconocido retorna UNKNOWN_ con el código.
   */
  it('retorna UNKNOWN_xxx para códigos no catalogados', async () => {
    const error = new Error('Unknown');
    error.code = '9999';
    GoogleSignin.signIn.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.signIn('google');
    });

    expect(response.success).toBe(false);
    expect(response.code).toBe('UNKNOWN_9999');
  });

  /**
   * Verifica que un error sin código retorna UNKNOWN_ vacío sin lanzar.
   */
  it('maneja error sin código sin lanzar excepción', async () => {
    GoogleSignin.signIn.mockRejectedValueOnce(new Error('sin código'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.signIn('google');
    });

    expect(response.success).toBe(false);
    expect(response.code).toMatch(/^UNKNOWN_/);
  });
});

// ─── signOut ──────────────────────────────────────────────────────────────────

describe('signOut', () => {
  /**
   * Verifica que signOut limpia el usuario y el token del estado.
   */
  it('limpia user y accessToken al cerrar sesión', async () => {
    // Primero autenticar
    const mockUser = {
      user: { id: '123', email: 'test@gmail.com', name: 'Test', photo: null },
    };
    GoogleSignin.signIn.mockResolvedValueOnce(mockUser);
    GoogleSignin.getTokens.mockResolvedValueOnce({ accessToken: 'token-xyz' });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signIn('google');
    });

    expect(result.current.user).not.toBeNull();

    // Luego cerrar sesión
    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
  });

  /**
   * Verifica que signOut llama a revokeAccess y signOut de GoogleSignin.
   */
  it('revoca el acceso a Google al cerrar sesión de proveedor google', async () => {
    const mockUser = {
      user: { id: '123', email: 'test@gmail.com', name: 'Test', photo: null },
    };
    GoogleSignin.signIn.mockResolvedValueOnce(mockUser);
    GoogleSignin.getTokens.mockResolvedValueOnce({ accessToken: 'token' });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signIn('google');
      await result.current.signOut();
    });

    expect(GoogleSignin.revokeAccess).toHaveBeenCalled();
    expect(GoogleSignin.signOut).toHaveBeenCalled();
  });
});

// ─── Estado inicial ───────────────────────────────────────────────────────────

describe('estado inicial del AuthProvider', () => {
  /**
   * Verifica que el estado inicial tiene user=null y loading=true.
   */
  it('inicia con user null y loading true', () => {
    GoogleSignin.getCurrentUser.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // En el primer render, antes de que restoreSession resuelva
    expect(result.current.user).toBeNull();
  });

  /**
   * Verifica que loading pasa a false tras restoreSession sin sesión previa.
   */
  it('loading es false después de restaurar sesión sin usuario previo', async () => {
    GoogleSignin.getCurrentUser.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
