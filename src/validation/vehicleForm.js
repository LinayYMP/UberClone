// AI-assisted: see docs/AI_LOG.md #1
// Pestaña 2 — Vehículo: valores vacíos, validación, normalización antes de guardar
// y conversión de lo guardado a valores del formulario.
import { VEHICLE_CATEGORIES, VEHICLE_COLORS, VEHICLE_RULES } from '../constants/registration.js';
import { fieldError, hasErrors, isBlank, isColombianCarPlate, normalizePlate, normalizeSpaces } from '../utils/validators.js';

export const EMPTY_VEHICLE = {
  category: '',
  plate: '',
  brand: '',
  model: '',
  year: '',
  color: '',
  capacity: '',
  photoUri: '',
};

const findCategory = (id) => VEHICLE_CATEGORIES.find((category) => category.id === id);

// Capacidad mínima exigida por la categoría (XL exige 6). Sin categoría elegida, 1.
export const minimumCapacityFor = (categoryId) => findCategory(categoryId)?.minCapacity ?? 1;

function validateTextLength(value, maxLength) {
  const text = normalizeSpaces(value);
  if (!text) {
    return fieldError('validation.required');
  }
  if (text.length > maxLength) {
    return fieldError('validation.maxLength', { max: maxLength });
  }
  return null;
}

export function validateVehicle(values, today = new Date()) {
  const errors = {};
  const { brandMaxLength, modelMaxLength, yearDigits } = VEHICLE_RULES;
  const currentYear = today.getFullYear();

  if (isBlank(values.category)) {
    errors.category = fieldError('validation.selectRequired');
  } else if (!findCategory(values.category)) {
    errors.category = fieldError('validation.invalidOption');
  }

  if (isBlank(values.plate)) {
    errors.plate = fieldError('validation.required');
  } else if (!isColombianCarPlate(values.plate)) {
    errors.plate = fieldError('validation.plate');
  }

  const brandError = validateTextLength(values.brand, brandMaxLength);
  if (brandError) {
    errors.brand = brandError;
  }

  const modelError = validateTextLength(values.model, modelMaxLength);
  if (modelError) {
    errors.model = modelError;
  }

  const year = String(values.year ?? '').trim();
  if (!year) {
    errors.year = fieldError('validation.required');
  } else if (!new RegExp(`^\\d{${yearDigits}}$`).test(year)) {
    errors.year = fieldError('validation.yearFormat');
  } else if (Number(year) > currentYear) {
    errors.year = fieldError('validation.yearMax', { max: currentYear });
  }

  if (isBlank(values.color)) {
    errors.color = fieldError('validation.selectRequired');
  } else if (!VEHICLE_COLORS.some((color) => color.id === values.color)) {
    errors.color = fieldError('validation.invalidOption');
  }

  const capacity = String(values.capacity ?? '').trim();
  const minCapacity = minimumCapacityFor(values.category);
  if (!capacity) {
    errors.capacity = fieldError('validation.required');
  } else if (!/^\d+$/.test(capacity)) {
    errors.capacity = fieldError('validation.numeric');
  } else if (Number(capacity) < 1) {
    errors.capacity = fieldError('validation.capacityMin', { min: 1 });
  } else if (Number(capacity) < minCapacity) {
    errors.capacity = fieldError('validation.capacityXl', { min: minCapacity });
  }

  if (isBlank(values.photoUri)) {
    errors.photoUri = fieldError('validation.photoRequired');
  }

  return errors;
}

// Datos tal como se envían al servidor: placa en mayúsculas, año y capacidad como números.
export function normalizeVehicle(values) {
  return {
    category: values.category,
    plate: normalizePlate(values.plate),
    brand: normalizeSpaces(values.brand),
    model: normalizeSpaces(values.model),
    year: Number(values.year),
    color: values.color,
    capacity: Number(values.capacity),
    photoUri: values.photoUri,
  };
}

export function toVehicleForm(saved) {
  if (!saved) {
    return EMPTY_VEHICLE;
  }
  return {
    ...EMPTY_VEHICLE,
    ...saved,
    year: saved.year ? String(saved.year) : '',
    capacity: saved.capacity ? String(saved.capacity) : '',
  };
}

export function isVehicleComplete(saved, today = new Date()) {
  return Boolean(saved) && !hasErrors(validateVehicle(toVehicleForm(saved), today));
}
