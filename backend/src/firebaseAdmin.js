// AI-assisted: see docs/AI_LOG.md #11
// Firebase Admin: el backend no pasa por las reglas de seguridad. Con el proyecto real usa la cuenta
// de servicio indicada en GOOGLE_APPLICATION_CREDENTIALS; con el emulador no necesita credenciales.
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

import { config, usingEmulator } from './config.js';

const app = initializeApp(
  usingEmulator
    ? { projectId: config.firebaseProjectId }
    : { credential: applicationDefault(), projectId: config.firebaseProjectId },
);

export const db = getFirestore(app);
export const adminAuth = getAuth(app);
export const messaging = getMessaging(app);
export { FieldValue };

export const tripsCollection = db.collection('trips');
export const driversCollection = db.collection('drivers');
