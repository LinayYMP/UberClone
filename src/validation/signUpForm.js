// AI-assisted: see docs/AI_LOG.md #11
import { ACCOUNT_RULES } from '../constants/registration.js';
import { fieldError, isBlank, isValidEmail } from '../utils/validators.js';

export const EMPTY_SIGN_UP = { email: '', password: '', confirmPassword: '' };

// Creación de la cuenta con Firebase Authentication (correo y contraseña).
export function validateSignUp(values) {
  const errors = {};

  if (isBlank(values.email)) {
    errors.email = fieldError('validation.required');
  } else if (!isValidEmail(values.email)) {
    errors.email = fieldError('validation.email');
  }

  if (isBlank(values.password)) {
    errors.password = fieldError('validation.required');
  } else if (values.password.length < ACCOUNT_RULES.passwordMinLength) {
    errors.password = fieldError('validation.passwordLength', { min: ACCOUNT_RULES.passwordMinLength });
  }

  if (isBlank(values.confirmPassword)) {
    errors.confirmPassword = fieldError('validation.required');
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = fieldError('validation.passwordMismatch');
  }

  return errors;
}
