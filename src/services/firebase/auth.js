// AI-assisted: see docs/AI_LOG.md #11
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connectAuthEmulator, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';

import { app } from './app.js';
import { FIREBASE_EMULATOR_HOST, USE_FIREBASE_EMULATOR } from './config.js';

// Android/iOS: la sesión de Firebase se guarda en AsyncStorage para no pedir el login en cada
// apertura (el documento permite AsyncStorage para la sesión). La versión web está en auth.web.js.
function createAuth() {
  try {
    return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    return getAuth(app);
  }
}

export const auth = createAuth();

if (USE_FIREBASE_EMULATOR && !auth.emulatorConfig) {
  connectAuthEmulator(auth, `http://${FIREBASE_EMULATOR_HOST}:9099`, { disableWarnings: true });
}
