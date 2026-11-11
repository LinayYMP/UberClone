// AI-assisted: see docs/AI_LOG.md #1
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { DEFAULT_LANGUAGE, LANGUAGES, translate } from '../i18n/index.js';
import { loadLanguage, saveLanguage } from '../services/storage.js';

// Preferencias del dispositivo (por ahora el idioma). En entregas siguientes se suma el último
// estado de disponibilidad, que el documento también permite guardar en AsyncStorage.
const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE);
  const [isReady, setIsReady] = useState(false);

  // Al abrir la app se lee el idioma guardado. La limpieza evita actualizar el estado si el
  // proveedor se desmonta antes de que AsyncStorage responda.
  useEffect(() => {
    let isActive = true;
    loadLanguage().then((storedLanguage) => {
      if (!isActive) {
        return;
      }
      if (LANGUAGES.includes(storedLanguage)) {
        setLanguageState(storedLanguage);
      }
      setIsReady(true);
    });
    return () => {
      isActive = false;
    };
  }, []);

  const setLanguage = useCallback((nextLanguage) => {
    if (!LANGUAGES.includes(nextLanguage)) {
      return;
    }
    setLanguageState(nextLanguage);
    saveLanguage(nextLanguage);
  }, []);

  // t('clave', { parametros }) en el idioma actual. Cambia de identidad solo al cambiar el idioma.
  const t = useCallback((key, params) => translate(language, key, params), [language]);

  const value = useMemo(() => ({ language, setLanguage, t, isReady }), [language, setLanguage, t, isReady]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences debe usarse dentro de PreferencesProvider');
  }
  return context;
}
