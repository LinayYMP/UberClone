// AI-assisted: see docs/AI_LOG.md #1
// Pestaña 1 — Datos personales: valores vacíos, validación, normalización antes de guardar
// y conversión de lo guardado a valores del formulario.
import { GENDERS, PERSONAL_RULES } from '../constants/registration.js';
import { DEFAULT_LANGUAGE, LANGUAGES } from '../i18n/index.js';
import { calculateAge, parseISODate } from '../utils/dates.js';
import {
  fieldError,
  hasErrors,
  isBlank,
  isDigitsBetween,
  isLettersAndSpaces,
  isValidEmail,
  normalizeEmail,
  normalizeSpaces,
} from '../utils/validators.js';

export const EMPTY_PERSONAL_DATA = {
  photoUri: '',
  fullName: '',
  documentNumber: '',
  phone: '',
  birthDate: '',
  gender: '',
  email: '',
  language: DEFAULT_LANGUAGE,
};

export function validatePersonalData(values, today = new Date()) {
  const errors = {};
  const { fullNameMaxLength, documentMinDigits, documentMaxDigits, phoneDigits, minimumAge } = PERSONAL_RULES;

  if (isBlank(values.photoUri)) {
    errors.photoUri = fieldError('validation.photoRequired');
  }

  const fullName = normalizeSpaces(values.fullName);
  if (!fullName) {
    errors.fullName = fieldError('validation.required');
  } else if (fullName.length > fullNameMaxLength) {
    errors.fullName = fieldError('validation.maxLength', { max: fullNameMaxLength });
  } else if (!isLettersAndSpaces(fullName)) {
    errors.fullName = fieldError('validation.lettersOnly');
  }

  if (isBlank(values.documentNumber)) {
    errors.documentNumber = fieldError('validation.required');
  } else if (!isDigitsBetween(values.documentNumber, documentMinDigits, documentMaxDigits)) {
    errors.documentNumber = fieldError('validation.digitsRange', { min: documentMinDigits, max: documentMaxDigits });
  }

  if (isBlank(values.phone)) {
    errors.phone = fieldError('validation.required');
  } else if (!isDigitsBetween(values.phone, phoneDigits, phoneDigits)) {
    errors.phone = fieldError('validation.digitsExact', { length: phoneDigits });
  }

  const birthDate = parseISODate(values.birthDate);
  if (isBlank(values.birthDate)) {
    errors.birthDate = fieldError('validation.dateRequired');
  } else if (!birthDate || birthDate > today) {
    errors.birthDate = fieldError('validation.invalidDate');
  } else if (calculateAge(birthDate, today) < minimumAge) {
    errors.birthDate = fieldError('validation.underage', { age: minimumAge });
  }

  if (isBlank(values.gender)) {
    errors.gender = fieldError('validation.selectRequired');
  } else if (!GENDERS.includes(values.gender)) {
    errors.gender = fieldError('validation.invalidOption');
  }

  if (isBlank(values.email)) {
    errors.email = fieldError('validation.required');
  } else if (!isValidEmail(values.email)) {
    errors.email = fieldError('validation.email');
  }

  if (!LANGUAGES.includes(values.language)) {
    errors.language = fieldError('validation.selectRequired');
  }

  return errors;
}

// Datos tal como se envían al servidor.
export function normalizePersonalData(values) {
  return {
    photoUri: values.photoUri,
    fullName: normalizeSpaces(values.fullName),
    documentNumber: values.documentNumber.trim(),
    phone: values.phone.trim(),
    birthDate: values.birthDate,
    gender: values.gender,
    email: normalizeEmail(values.email),
    language: values.language,
  };
}

export function toPersonalDataForm(saved) {
  return saved ? { ...EMPTY_PERSONAL_DATA, ...saved } : EMPTY_PERSONAL_DATA;
}

export function isPersonalDataComplete(saved, today = new Date()) {
  return Boolean(saved) && !hasErrors(validatePersonalData(toPersonalDataForm(saved), today));
}
