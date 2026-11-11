// AI-assisted: see docs/AI_LOG.md #1, #11
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as authService from '../services/authService';

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

  // Firebase avisa en tiempo real si hay sesión (también al abrir la app con una sesión guardada).
  // La limpieza cancela la suscripción cuando el proveedor se desmonta.
  useEffect(() => {
    const unsubscribe = authService.subscribeToSession((nextSession) => {
      setSession(nextSession);
      setStatus(nextSession ? AUTH_STATUS.SIGNED_IN : AUTH_STATUS.SIGNED_OUT);
    });
    return unsubscribe;
  }, []);

  // Lanzan el ServiceError del servicio para que la pantalla muestre el mensaje.
  const signIn = useCallback((credentials) => authService.signIn(credentials), []);
  const signUp = useCallback((credentials) => authService.signUp(credentials), []);
  const signOut = useCallback(() => authService.signOut().catch(() => undefined), []);

  const value = useMemo(() => ({ session, status, signIn, signUp, signOut }), [session, status, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
