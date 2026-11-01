// AI-assisted: see docs/AI_LOG.md #1
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { REGISTRATION_SECTIONS } from '../constants/registration.js';
import * as driverService from '../services/driverService.js';
import { isPersonalDataComplete } from '../validation/personalDataForm.js';
import { isVehicleComplete } from '../validation/vehicleForm.js';
import { useAuth } from './AuthContext.js';

// Registro del conductor guardado en el servidor, compartido por las pestañas del registro.
// Cada pestaña maneja su borrador con useState (useForm) y aquí solo llega lo que se guarda.
export const LOAD_STATUS = {
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
};

const RegistrationContext = createContext(null);

export function RegistrationProvider({ children }) {
  const { session } = useAuth();
  const driverId = session?.driverId;

  const [registration, setRegistration] = useState(null);
  const [loadStatus, setLoadStatus] = useState(LOAD_STATUS.LOADING);
  const [reloadCount, setReloadCount] = useState(0);

  // Carga el registro del conductor. Si se cierra la sesión antes de que responda el servidor,
  // la limpieza descarta la respuesta.
  useEffect(() => {
    if (!driverId) {
      return undefined;
    }
    let isActive = true;
    driverService
      .getDriverRegistration(driverId)
      .then((data) => {
        if (isActive) {
          setRegistration(data);
          setLoadStatus(LOAD_STATUS.READY);
        }
      })
      .catch(() => {
        if (isActive) {
          setLoadStatus(LOAD_STATUS.ERROR);
        }
      });
    return () => {
      isActive = false;
    };
  }, [driverId, reloadCount]);

  const reload = useCallback(() => {
    setLoadStatus(LOAD_STATUS.LOADING);
    setReloadCount((count) => count + 1);
  }, []);

  // Lanzan ServiceError si el servidor rechaza los datos; la pantalla muestra el mensaje.
  const savePersonalData = useCallback(
    async (values) => {
      setRegistration(await driverService.savePersonalData(driverId, values));
    },
    [driverId],
  );

  const saveVehicle = useCallback(
    async (values) => {
      setRegistration(await driverService.saveVehicle(driverId, values));
    },
    [driverId],
  );

  // useMemo: el avance solo se recalcula cuando cambia el registro guardado.
  // La pestaña Documentos llega en la siguiente entrega, por eso siempre está pendiente.
  const progress = useMemo(
    () => ({
      personalData: isPersonalDataComplete(registration?.personalData),
      vehicle: isVehicleComplete(registration?.vehicle),
      documents: false,
    }),
    [registration],
  );

  const completedSections = useMemo(
    () => REGISTRATION_SECTIONS.filter((section) => progress[section]).length,
    [progress],
  );

  const value = useMemo(
    () => ({
      registration,
      loadStatus,
      reload,
      progress,
      completedSections,
      savePersonalData,
      saveVehicle,
    }),
    [registration, loadStatus, reload, progress, completedSections, savePersonalData, saveVehicle],
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
