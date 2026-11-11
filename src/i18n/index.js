// AI-assisted: see docs/AI_LOG.md #1
import en from './en.js';
import es from './es.js';

// Selector de idioma español / inglés (el mismo de la app del pasajero).
export const LANGUAGES = ['es', 'en'];
export const DEFAULT_LANGUAGE = 'es';

// Locale que usan los selectores nativos de fecha.
export const DATE_LOCALES = { es: 'es-CO', en: 'en-US' };

const DICTIONARIES = { es, en };

function lookup(dictionary, key) {
  return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dictionary);
}

// translate('es', 'validation.maxLength', { max: 50 }) -> 'Máximo 50 caracteres.'
// Si la clave no existe en el idioma pedido se usa el español y, en último caso, la clave.
export function translate(language, key, params) {
  const dictionary = DICTIONARIES[language] ?? DICTIONARIES[DEFAULT_LANGUAGE];
  const text = lookup(dictionary, key) ?? lookup(DICTIONARIES[DEFAULT_LANGUAGE], key);

  if (typeof text !== 'string') {
    return key;
  }
  if (!params) {
    return text;
  }
  return text.replace(/\{\{(\w+)\}\}/g, (match, name) => (name in params ? String(params[name]) : match));
}
