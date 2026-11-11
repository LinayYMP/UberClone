// AI-assisted: see docs/AI_LOG.md #1, #11
// Autenticación del conductor con Firebase Authentication (correo y contraseña).
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { normalizeEmail } from '../utils/validators.js';
import { ensureDriverProfile } from './driverService';
import { auth } from './firebase/auth';
import { toServiceError } from './serviceError.js';

const toSession = (user) => (user ? { uid: user.uid, email: user.email } : null);

// Escucha la sesión en tiempo real; devuelve la función para dejar de escuchar.
export function subscribeToSession(callback) {
  return onAuthStateChanged(auth, (user) => callback(toSession(user)));
}

// Firebase responde con el mismo error si el correo no existe o la contraseña no coincide.
export async function signIn({ email, password }) {
  try {
    await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
  } catch (error) {
    throw toServiceError(error);
  }
}

// Crea la cuenta y el documento del conductor en estado "Registro incompleto".
export async function signUp({ email, password }) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
    await ensureDriverProfile(credential.user.uid, credential.user.email);
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function signOut() {
  await firebaseSignOut(auth);
}

// Token que el backend verifica antes de crear un cobro.
export async function getIdToken() {
  return auth.currentUser ? auth.currentUser.getIdToken() : null;
}
