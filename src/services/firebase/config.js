// AI-assisted: see docs/AI_LOG.md #11
// Configuración de Firebase leída del archivo .env (ver .env.example). Expo solo incluye en la app las
// variables EXPO_PUBLIC_* y únicamente si se leen así, una por una (no con desestructuración).
// La configuración web de Firebase no es secreta; la protegen las reglas de firestore.rules.
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// En desarrollo se puede usar el emulador local de Firebase (npm run emuladores).
export const USE_FIREBASE_EMULATOR = process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === 'true';

// En un celular, "localhost" es el propio celular: hay que poner la IP del computador.
export const FIREBASE_EMULATOR_HOST = process.env.EXPO_PUBLIC_FIREBASE_EMULATOR_HOST || 'localhost';

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
