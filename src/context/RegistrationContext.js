// AI-assisted: see docs/AI_LOG.md #1, #11
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ACCOUNT_STATUS, REGISTRATION_SECTIONS } from '../constants/registration.js';
import * as driverService from '../services/driverService';
import { isDocumentsComplete } from '../validation/documentsForm.js';
import { isPersonalDataComplete } from '../validation/personalDataForm.js';
import { isVehicleComplete } from '../validation/vehicleForm.js';
import { useAuth } from './AuthContext.js';

// Registro y perfil del conductor (documento drivers/{uid} en Firestore), compartido por las
// pestañas del registro, el inicio y el perfil. Cada formulario maneja su borrador con useState.
export const LOAD_STATUS = {
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
};

const RegistrationContext = createContext(null);

export function RegistrationProvider({ children }) {
  const { session } = useAuth();
  const driverId = session?.uid;
  const email = session?.email;

  const [registration, setRegistration] = useState(null);
  const [loadStatus, setLoadStatus] = useState(LOAD_STATUS.LOADING);
  const [reloadCount, setReloadCount] = useState(0);

  // Suscripción en tiempo real al documento del conductor: si la cuenta se aprueba en la base de
  // datos, la app lo ve al instante. La limpieza cancela la suscripción (al cerrar sesión o reintentar).
  useEffect(() => {
    if (!driverId) {
      return undefined;
    }
    const unsubscribe = driverService.subscribeToDriver(
      driverId,
      (data) => {
        if (!data) {
          // Cuenta creada sin documento (por ejemplo, se cortó la conexión al registrarse).
          driverService.ensureDriverProfile(driverId, email).catch(() => setLoadStatus(LOAD_STATUS.ERROR));
          return;
        }
        setRegistration(data);
        setLoadStatus(LOAD_STATUS.READY);
      },
      () => setLoadStatus(LOAD_STATUS.ERROR),
    );
    return unsubscribe;
  }, [driverId, email, reloadCount]);

  const reload = useCallback(() => {
    setLoadStatus(LOAD_STATUS.LOADING);
    setReloadCount((count) => count + 1);
  }, []);

  const vehicleYear = registration?.vehicle?.year;

  // Lanzan ServiceError si Firestore rechaza los datos; la pantalla muestra el mensaje.
  const savePersonalData = useCallback((values) => driverService.savePersonalData(driverId, values), [driverId]);
  const saveVehicle = useCallback((values) => driverService.saveVehicle(driverId, values), [driverId]);
  const saveDocuments = useCallback(
    (values) => driverService.saveDocuments(driverId, values, vehicleYear),
    [driverId, vehicleYear],
  );
  const submitRegistration = useCallback(() => driverService.submitRegistration(driverId), [driverId]);

  // useMemo: el avance solo se recalcula cuando cambia el registro guardado.
  const progress = useMemo(
    () => ({
      personalData: isPersonalDataComplete(registration?.personalData),
      vehicle: isVehicleComplete(registration?.vehicle),
      documents: isDocumentsComplete(registration?.documents, vehicleYear),
    }),
    [registration, vehicleYear],
  );

  const completedSections = useMemo(
    () => REGISTRATION_SECTIONS.filter((section) => progress[section]).length,
    [progress],
  );

  // "Enviar registro" solo se habilita con las tres pestañas completas y válidas.
  const canSubmit = completedSections === REGISTRATION_SECTIONS.length && registration?.accountStatus === ACCOUNT_STATUS.INCOMPLETE;

  const value = useMemo(
    () => ({
      driverId,
      registration,
      loadStatus,
      reload,
      progress,
      completedSections,
      canSubmit,
      savePersonalData,
      saveVehicle,
      saveDocuments,
      submitRegistration,
    }),
    [
      driverId,
      registration,
      loadStatus,
      reload,
      progress,
      completedSections,
      canSubmit,
      savePersonalData,
      saveVehicle,
      saveDocuments,
      submitRegistration,
    ],
  );

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration debe usarse dentro de RegistrationProvider');
  }
  return context;
}
