// AI-assisted: see docs/AI_LOG.md #11
import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore, initializeFirestore } from 'firebase/firestore';

import { FIREBASE_EMULATOR_HOST, firebaseConfig, USE_FIREBASE_EMULATOR } from './config.js';

// Una sola instancia aunque Fast Refresh vuelva a ejecutar el módulo.
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

function createFirestore() {
  try {
    // En React Native el canal por defecto de Firestore puede fallar; long polling es más estable.
    return initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  } catch {
    return getFirestore(app);
  }
}

export const db = createFirestore();

if (USE_FIREBASE_EMULATOR && !globalThis.__uberCloneFirestoreEmulator) {
  connectFirestoreEmulator(db, FIREBASE_EMULATOR_HOST, 8080);
  globalThis.__uberCloneFirestoreEmulator = true;
}
