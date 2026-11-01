// AI-assisted: see docs/AI_LOG.md #1
// Registro del conductor en el servidor (colección drivers). Las pantallas nunca hablan con el
// servidor directamente: usan RegistrationContext, que llama a estas funciones.
import { hasErrors } from '../utils/validators.js';
import { normalizePersonalData, validatePersonalData } from '../validation/personalDataForm.js';
import { normalizeVehicle, validateVehicle } from '../validation/vehicleForm.js';
import { findDriverById, simulateLatency, updateDriver } from './mock/mockServer.js';
import { ERROR_CODES, ServiceError, toServiceError } from './serviceError.js';

// Solo lo que la app necesita del registro (nunca la contraseña ni otros datos de la cuenta).
function toRegistration(driver) {
  return {
    accountStatus: driver.accountStatus,
    personalData: driver.personalData,
    vehicle: driver.vehicle,
    documents: driver.documents,
  };
}

export async function getDriverRegistration(driverId) {
  try {
    await simulateLatency();
    const driver = findDriverById(driverId);
    if (!driver) {
      throw new ServiceError(ERROR_CODES.NOT_FOUND);
    }
    return toRegistration(driver);
  } catch (error) {
    throw toServiceError(error);
  }
}

// El servidor vuelve a validar: la validación de la app nunca es la única barrera.
async function saveSection(driverId, field, values, validate, normalize) {
  try {
    if (hasErrors(validate(values))) {
      throw new ServiceError(ERROR_CODES.VALIDATION);
    }
    await simulateLatency();
    const updated = updateDriver(driverId, { [field]: normalize(values) });
    if (!updated) {
      throw new ServiceError(ERROR_CODES.NOT_FOUND);
    }
    return toRegistration(updated);
  } catch (error) {
    throw toServiceError(error);
  }
}

export function savePersonalData(driverId, values) {
  return saveSection(driverId, 'personalData', values, validatePersonalData, normalizePersonalData);
}

export function saveVehicle(driverId, values) {
  return saveSection(driverId, 'vehicle', values, validateVehicle, normalizeVehicle);
}
