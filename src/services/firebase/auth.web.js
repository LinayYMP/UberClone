// AI-assisted: see docs/AI_LOG.md #11
import { connectAuthEmulator, getAuth } from 'firebase/auth';

import { app } from './app.js';
import { FIREBASE_EMULATOR_HOST, USE_FIREBASE_EMULATOR } from './config.js';

// Web: Firebase guarda la sesión en el almacenamiento del navegador por su cuenta.
export const auth = getAuth(app);

if (USE_FIREBASE_EMULATOR && !auth.emulatorConfig) {
  connectAuthEmulator(auth, `http://${FIREBASE_EMULATOR_HOST}:9099`, { disableWarnings: true });
}
