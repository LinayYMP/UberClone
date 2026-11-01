// AI-assisted: see docs/AI_LOG.md #1
// Autenticación del conductor. Única puerta de entrada al servidor para la sesión.
import { normalizeEmail } from '../utils/validators.js';
import { findDriverByEmail, findDriverById, simulateLatency } from './mock/mockServer.js';
import { ERROR_CODES, ServiceError, toServiceError } from './serviceError.js';

const createSessionToken = (driverId) => `mock-${driverId}-${Date.now().toString(36)}`;

// Devuelve la sesión { driverId, email, token } o lanza ServiceError.
export async function signIn({ email, password }) {
  try {
    await simulateLatency();
    const driver = findDriverByEmail(normalizeEmail(email));

    // Mismo error si el correo no existe o la contraseña no coincide: no revela qué cuentas existen.
    if (!driver || driver.password !== password) {
      throw new ServiceError(ERROR_CODES.INVALID_CREDENTIALS);
    }

    return { driverId: driver.id, email: driver.email, token: createSessionToken(driver.id) };
  } catch (error) {
    throw toServiceError(error);
  }
}

// Comprueba que la sesión guardada en el dispositivo siga siendo válida; si no, devuelve null.
export async function restoreSession(session) {
  if (!session?.driverId || !session?.token) {
    return null;
  }
  await simulateLatency(300);
  return findDriverById(session.driverId) ? session : null;
}

export async function signOut() {
  await simulateLatency(200);
}
