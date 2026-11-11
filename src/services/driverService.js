// AI-assisted: see docs/AI_LOG.md #1, #11
// Documento del conductor en Firestore: drivers/{uid}. Las pantallas no hablan con Firestore
// directamente: usan RegistrationContext, que llama a estas funciones.
import { doc, onSnapshot, runTransaction, serverTimestamp, updateDoc } from 'firebase/firestore';

import { ACCOUNT_STATUS } from '../constants/registration.js';
import { hasErrors } from '../utils/validators.js';
import { DOCUMENT_PHOTO_FIELDS, normalizeDocuments, validateDocuments } from '../validation/documentsForm.js';
import { normalizePersonalData, validatePersonalData } from '../validation/personalDataForm.js';
import { normalizeVehicle, validateVehicle } from '../validation/vehicleForm.js';
import { db } from './firebase/app.js';
import { uploadPhotos } from './mediaService';
import { ERROR_CODES, ServiceError, toServiceError, withTimeout } from './serviceError.js';

const driverRef = (driverId) => doc(db, 'drivers', driverId);

// Lo que la app usa del documento del conductor.
function toRegistration(data) {
  return {
    email: data.email,
    accountStatus: data.accountStatus,
    personalData: data.personalData ?? null,
    vehicle: data.vehicle ?? null,
    documents: data.documents ?? null,
    isAvailable: data.isAvailable === true,
  };
}

// Crea el documento si todavía no existe (al crear la cuenta). Es seguro llamarla varias veces.
export async function ensureDriverProfile(driverId, email) {
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(driverRef(driverId));
    if (snapshot.exists()) {
      return;
    }
    transaction.set(driverRef(driverId), {
      email,
      accountStatus: ACCOUNT_STATUS.INCOMPLETE,
      personalData: null,
      vehicle: null,
      documents: null,
      isAvailable: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}

// Escucha el documento en tiempo real (por ejemplo, cuando se aprueba la cuenta).
// Devuelve la función que cancela la suscripción.
export function subscribeToDriver(driverId, onChange, onError) {
  return onSnapshot(
    driverRef(driverId),
    (snapshot) => onChange(snapshot.exists() ? toRegistration(snapshot.data()) : null),
    (error) => onError?.(toServiceError(error)),
  );
}

// Valida otra vez antes de guardar (la validación de la pantalla no es la única barrera),
// sube las fotos y guarda la sección.
async function saveSection(driverId, field, values, { validate, normalize, photoFields }) {
  try {
    if (hasErrors(validate(values))) {
      throw new ServiceError(ERROR_CODES.VALIDATION);
    }
    const withPhotos = await uploadPhotos(values, photoFields, `uberclone/drivers/${driverId}`);
    await withTimeout(updateDoc(driverRef(driverId), { [field]: normalize(withPhotos), updatedAt: serverTimestamp() }));
  } catch (error) {
    throw toServiceError(error);
  }
}

export function savePersonalData(driverId, values) {
  return saveSection(driverId, 'personalData', values, {
    validate: validatePersonalData,
    normalize: normalizePersonalData,
    photoFields: ['photoUri'],
  });
}

export function saveVehicle(driverId, values) {
  return saveSection(driverId, 'vehicle', values, {
    validate: validateVehicle,
    normalize: normalizeVehicle,
    photoFields: ['photoUri'],
  });
}

// La revisión técnico-mecánica depende del año del vehículo guardado en la pestaña 2.
export function saveDocuments(driverId, values, vehicleYear) {
  return saveSection(driverId, 'documents', values, {
    validate: (formValues) => validateDocuments(formValues, { vehicleYear }),
    normalize: (formValues) => normalizeDocuments(formValues, { vehicleYear }),
    photoFields: DOCUMENT_PHOTO_FIELDS,
  });
}

// "Enviar registro": la cuenta queda pendiente de aprobación. La aprobación se hace cambiando el
// campo accountStatus a "approved" en la base de datos (las reglas no dejan que el conductor lo haga).
export async function submitRegistration(driverId) {
  try {
    await withTimeout(
      updateDoc(driverRef(driverId), {
        accountStatus: ACCOUNT_STATUS.PENDING_APPROVAL,
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  } catch (error) {
    throw toServiceError(error);
  }
}

export async function setAvailability(driverId, isAvailable) {
  try {
    await withTimeout(updateDoc(driverRef(driverId), { isAvailable, availabilityUpdatedAt: serverTimestamp() }));
  } catch (error) {
    throw toServiceError(error);
  }
}

// Ubicación en tiempo real mientras el conductor está Disponible o en un viaje.
export async function updateLocation(driverId, location) {
  await updateDoc(driverRef(driverId), { location, locationUpdatedAt: serverTimestamp() });
}

// Token de Firebase Cloud Messaging para avisar de solicitudes con la app en segundo plano.
export async function savePushToken(driverId, fcmToken) {
  await updateDoc(driverRef(driverId), { fcmToken, fcmTokenUpdatedAt: serverTimestamp() });
}
