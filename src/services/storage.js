// AI-assisted: see docs/AI_LOG.md #1
// AsyncStorage solo para la sesión y las preferencias (requisito del proyecto). Nunca se guardan
// aquí datos personales, documentos, números de cuenta ni de tarjeta.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  session: '@uberclone/session',
  language: '@uberclone/language',
};

async function readJson(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Si el almacenamiento falla la app sigue funcionando; solo se pierde el dato al reiniciar.
async function writeJson(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // sin acción: el valor sigue en memoria
  }
}

async function remove(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // sin acción
  }
}

export const loadSession = () => readJson(KEYS.session);
export const saveSession = (session) => writeJson(KEYS.session, session);
export const clearSession = () => remove(KEYS.session);

export const loadLanguage = () => readJson(KEYS.language);
export const saveLanguage = (language) => writeJson(KEYS.language, language);
