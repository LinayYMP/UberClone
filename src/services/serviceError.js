// AI-assisted: see docs/AI_LOG.md #1, #11
// Error común de la capa de servicios. Las pantallas solo leen `code` y muestran el texto traducido.
export const ERROR_CODES = {
  INVALID_CREDENTIALS: 'invalid-credentials',
  EMAIL_IN_USE: 'email-in-use',
  WEAK_PASSWORD: 'weak-password',
  TOO_MANY_REQUESTS: 'too-many-requests',
  NOT_FOUND: 'not-found',
  VALIDATION: 'validation',
  PERMISSION_DENIED: 'permission-denied',
  TRIP_UNAVAILABLE: 'trip-unavailable',
  INVALID_TRANSITION: 'invalid-transition',
  ROUTE_NOT_FOUND: 'route-not-found',
  UPLOAD_FAILED: 'upload-failed',
  BACKEND_NOT_CONFIGURED: 'backend-not-configured',
  PAYMENT_FAILED: 'payment-failed',
  NETWORK: 'network',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown',
};

export class ServiceError extends Error {
  constructor(code, message = code) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
  }
}

// Códigos de Firebase Authentication y Firestore -> códigos propios.
const FIREBASE_CODES = {
  'auth/invalid-credential': ERROR_CODES.INVALID_CREDENTIALS,
  'auth/invalid-login-credentials': ERROR_CODES.INVALID_CREDENTIALS,
  'auth/wrong-password': ERROR_CODES.INVALID_CREDENTIALS,
  'auth/user-not-found': ERROR_CODES.INVALID_CREDENTIALS,
  'auth/invalid-email': ERROR_CODES.INVALID_CREDENTIALS,
  'auth/email-already-in-use': ERROR_CODES.EMAIL_IN_USE,
  'auth/weak-password': ERROR_CODES.WEAK_PASSWORD,
  'auth/too-many-requests': ERROR_CODES.TOO_MANY_REQUESTS,
  'auth/network-request-failed': ERROR_CODES.NETWORK,
  'permission-denied': ERROR_CODES.PERMISSION_DENIED,
  'not-found': ERROR_CODES.NOT_FOUND,
  unavailable: ERROR_CODES.NETWORK,
  'deadline-exceeded': ERROR_CODES.TIMEOUT,
};

// Convierte cualquier error (Firebase, fetch sin conexión...) en un ServiceError.
export function toServiceError(error) {
  if (error instanceof ServiceError) {
    return error;
  }
  const mapped = FIREBASE_CODES[error?.code];
  if (mapped) {
    return new ServiceError(mapped, error.message);
  }
  if (error instanceof TypeError && /network|fetch/i.test(error.message)) {
    return new ServiceError(ERROR_CODES.NETWORK, error.message);
  }
  if (error?.name === 'AbortError') {
    return new ServiceError(ERROR_CODES.TIMEOUT, error.message);
  }
  return new ServiceError(ERROR_CODES.UNKNOWN, error?.message);
}

// Sin conexión, Firestore espera indefinidamente la confirmación del servidor; así la pantalla
// puede mostrar un error en lugar de quedarse cargando.
export function withTimeout(promise, ms = 15000) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new ServiceError(ERROR_CODES.TIMEOUT)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
