// AI-assisted: see docs/AI_LOG.md #1
import { fieldError, isBlank, isValidEmail } from '../utils/validators.js';

export const EMPTY_LOGIN = { email: '', password: '' };

// Validación local antes de llamar al servidor: campos obligatorios y formato de correo.
export function validateLogin(values) {
  const errors = {};

  if (isBlank(values.email)) {
    errors.email = fieldError('validation.required');
  } else if (!isValidEmail(values.email)) {
    errors.email = fieldError('validation.email');
  }

  if (isBlank(values.password)) {
    errors.password = fieldError('validation.required');
  }

  return errors;
}
