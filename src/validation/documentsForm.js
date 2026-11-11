// AI-assisted: see docs/AI_LOG.md #11
// Pestaña 3 — Documentos y pagos: licencia, SOAT, revisión técnico-mecánica, correo de Mercado Pago
// y aceptación de términos. No se piden ni se guardan números de cuenta bancaria ni de tarjeta.
import { DOCUMENT_RULES } from '../constants/registration.js';
import { PRICING } from '../config/pricing.js';
import { parseISODate } from '../utils/dates.js';
import { fieldError, hasErrors, isBlank, isValidEmail, normalizeEmail } from '../utils/validators.js';

export const EMPTY_DOCUMENTS = {
  licenseNumber: '',
  licensePhotoUri: '',
  licenseExpiresAt: '',
  soatPhotoUri: '',
  soatExpiresAt: '',
  inspectionPhotoUri: '',
  inspectionExpiresAt: '',
  mercadoPagoEmail: '',
  termsAccepted: false,
};

// Campos con foto: se suben a Cloudinary antes de guardar (ver services/mediaService.js).
export const DOCUMENT_PHOTO_FIELDS = ['licensePhotoUri', 'soatPhotoUri', 'inspectionPhotoUri'];

// La revisión técnico-mecánica aplica según el año del vehículo (pestaña 2).
export function requiresTechnicalInspection(vehicleYear, today = new Date()) {
  if (!vehicleYear) {
    return false;
  }
  return today.getFullYear() - Number(vehicleYear) >= DOCUMENT_RULES.technicalInspectionAfterYears;
}

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

// Fecha de vencimiento obligatoria y posterior a hoy.
function validateExpiry(value, today) {
  if (isBlank(value)) {
    return fieldError('validation.dateRequired');
  }
  const date = parseISODate(value);
  if (!date) {
    return fieldError('validation.invalidDate');
  }
  if (date <= startOfDay(today)) {
    return fieldError('validation.expired');
  }
  return null;
}

export function validateDocuments(values, { vehicleYear, today = new Date() } = {}) {
  const errors = {};
  const { licenseMinLength, licenseMaxLength } = DOCUMENT_RULES;

  const licenseNumber = String(values.licenseNumber ?? '').trim();
  if (!licenseNumber) {
    errors.licenseNumber = fieldError('validation.required');
  } else if (!new RegExp(`^[A-Za-z0-9]{${licenseMinLength},${licenseMaxLength}}$`).test(licenseNumber)) {
    errors.licenseNumber = fieldError('validation.licenseNumber', { min: licenseMinLength, max: licenseMaxLength });
  }

  const checks = [
    ['licensePhotoUri', 'licenseExpiresAt'],
    ['soatPhotoUri', 'soatExpiresAt'],
  ];
  if (requiresTechnicalInspection(vehicleYear, today)) {
    checks.push(['inspectionPhotoUri', 'inspectionExpiresAt']);
  }
  for (const [photoField, expiryField] of checks) {
    if (isBlank(values[photoField])) {
      errors[photoField] = fieldError('validation.photoRequired');
    }
    const expiryError = validateExpiry(values[expiryField], today);
    if (expiryError) {
      errors[expiryField] = expiryError;
    }
  }

  if (isBlank(values.mercadoPagoEmail)) {
    errors.mercadoPagoEmail = fieldError('validation.required');
  } else if (!isValidEmail(values.mercadoPagoEmail)) {
    errors.mercadoPagoEmail = fieldError('validation.email');
  }

  if (values.termsAccepted !== true) {
    errors.termsAccepted = fieldError('validation.termsRequired');
  }

  return errors;
}

// Datos tal como se envían a Firestore. Si la revisión no aplica, sus campos quedan vacíos.
export function normalizeDocuments(values, { vehicleYear, today = new Date() } = {}) {
  const inspectionApplies = requiresTechnicalInspection(vehicleYear, today);
  return {
    licenseNumber: String(values.licenseNumber).trim().toUpperCase(),
    licensePhotoUri: values.licensePhotoUri,
    licenseExpiresAt: values.licenseExpiresAt,
    soatPhotoUri: values.soatPhotoUri,
    soatExpiresAt: values.soatExpiresAt,
    inspectionPhotoUri: inspectionApplies ? values.inspectionPhotoUri : '',
    inspectionExpiresAt: inspectionApplies ? values.inspectionExpiresAt : '',
    mercadoPagoEmail: normalizeEmail(values.mercadoPagoEmail),
    termsAccepted: true,
    // Porcentaje de comisión que el conductor vio al aceptar los términos.
    commissionRateAccepted: PRICING.commissionRate,
  };
}

export function toDocumentsForm(saved) {
  return saved ? { ...EMPTY_DOCUMENTS, ...saved } : EMPTY_DOCUMENTS;
}

export function isDocumentsComplete(saved, vehicleYear, today = new Date()) {
  return Boolean(saved) && !hasErrors(validateDocuments(toDocumentsForm(saved), { vehicleYear, today }));
}
