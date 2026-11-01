// AI-assisted: see docs/AI_LOG.md #1
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as authService from '../services/authService.js';
import { clearSession, loadSession, saveSession } from '../services/storage.js';

// Sesión del conductor compartida con useContext (requisito del proyecto).
// RootNavigator lee `status` para decidir qué pantallas mostrar.
export const AUTH_STATUS = {
  RESTORING: 'restoring',
  SIGNED_OUT: 'signedOut',
  SIGNED_IN: 'signedIn',
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState(AUTH_STATUS.RESTORING);

  // Al abrir la app se recupera la sesión guardada y se comprueba con el servidor.
  // La limpieza evita actualizar el estado si el proveedor se desmonta antes de terminar.
  useEffect(() => {
    let isActive = true;

    async function restore() {
      const storedSession = await loadSession();
      const restoredSession = storedSession ? await authService.restoreSession(storedSession).catch(() => null) : null;
      if (storedSession && !restoredSession) {
        await clearSession();
      }
      if (isActive) {
        setSession(restoredSession);
        setStatus(restoredSession ? AUTH_STATUS.SIGNED_IN : AUTH_STATUS.SIGNED_OUT);
      }
    }

    restore();
    return () => {
      isActive = false;
    };
  }, []);

  // Lanza el ServiceError del servicio para que la pantalla de login muestre el mensaje.
  const signIn = useCallback(async (credentials) => {
    const newSession = await authService.signIn(credentials);
    await saveSession(newSession);
    setSession(newSession);
    setStatus(AUTH_STATUS.SIGNED_IN);
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut().catch(() => undefined);
    await clearSession();
    setSession(null);
    setStatus(AUTH_STATUS.SIGNED_OUT);
  }, []);

  const value = useMemo(() => ({ session, status, signIn, signOut }), [session, status, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
