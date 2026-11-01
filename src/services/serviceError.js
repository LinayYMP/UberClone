// AI-assisted: see docs/AI_LOG.md #1
// Error común de la capa de servicios. Las pantallas solo leen `code` y muestran el texto traducido.
export const ERROR_CODES = {
  INVALID_CREDENTIALS: 'invalid-credentials',
  NOT_FOUND: 'not-found',
  VALIDATION: 'validation',
  NETWORK: 'network',
  UNKNOWN: 'unknown',
};

export class ServiceError extends Error {
  constructor(code, message = code) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
  }
}

// Convierte cualquier error (por ejemplo, el TypeError de fetch sin conexión) en un ServiceError.
export function toServiceError(error) {
  if (error instanceof ServiceError) {
    return error;
  }
  if (error instanceof TypeError && /network/i.test(error.message)) {
    return new ServiceError(ERROR_CODES.NETWORK, error.message);
  }
  return new ServiceError(ERROR_CODES.UNKNOWN, error?.message);
}
