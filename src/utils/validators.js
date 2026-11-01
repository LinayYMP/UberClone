// AI-assisted: see docs/AI_LOG.md #1
// Funciones puras de validación y normalización. No conocen la interfaz ni el idioma:
// los formularios las combinan y devuelven claves de error que la pantalla traduce.

// Error de un campo: clave de traducción + parámetros, p. ej. { key: 'validation.maxLength', params: { max: 50 } }.
export const fieldError = (key, params) => ({ key, params });

export const hasErrors = (errors) => Object.keys(errors).length > 0;

// Ningún campo puede quedar nulo, vacío ni con solo espacios.
export const isBlank = (value) => value === null || value === undefined || String(value).trim() === '';

// Quita espacios al inicio y al final y deja un solo espacio entre palabras.
export const normalizeSpaces = (value) => String(value ?? '').trim().replace(/\s+/g, ' ');

// Deja solo los dígitos (el teclado del celular puede permitir '.' o '-') y recorta al máximo.
// Se limpia antes de recortar: al pegar "300-123-4567" quedan los 10 dígitos, no "300-123-45".
export const keepDigits = (value, maxLength = Infinity) => String(value ?? '').replace(/\D/g, '').slice(0, maxLength);

export const isDigitsBetween = (value, min, max) => new RegExp(`^\\d{${min},${max}}$`).test(String(value ?? ''));

// Letras (incluidas tildes, ü y ñ) y espacios.
export const isLettersAndSpaces = (value) => /^[A-Za-zÀ-ÖØ-öø-ÿ ]+$/.test(String(value ?? ''));

// Exige texto antes de la @ y un dominio con extensión: nombre@dominio.com
export const isValidEmail = (value) =>
  /^[^\s@]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(String(value ?? '').trim());

export const normalizeEmail = (value) => String(value ?? '').trim().toLowerCase();

// La placa se convierte a mayúsculas antes de validar; también se quitan espacios y guiones.
export const normalizePlate = (value) => String(value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');

// Placa colombiana de carro: tres letras y tres números (ABC123).
export const isColombianCarPlate = (value) => /^[A-Z]{3}\d{3}$/.test(normalizePlate(value));
