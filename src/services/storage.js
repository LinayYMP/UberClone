// AI-assisted: see docs/AI_LOG.md #1, #11
// AsyncStorage solo para preferencias y la sesión (requisito del proyecto): idioma y último estado
// de disponibilidad. La sesión la guarda Firebase Authentication. Nunca se guardan aquí datos
// personales, documentos, números de cuenta ni de tarjeta.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  language: '@uberclone/language',
  lastAvailability: '@uberclone/lastAvailability',
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

export const loadLanguage = () => readJson(KEYS.language);
export const saveLanguage = (language) => writeJson(KEYS.language, language);

export const loadLastAvailability = async () => (await readJson(KEYS.lastAvailability)) === true;
export const saveLastAvailability = (isAvailable) => writeJson(KEYS.lastAvailability, isAvailable);
