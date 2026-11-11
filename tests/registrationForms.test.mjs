// AI-assisted: see docs/AI_LOG.md #1
// Reglas de las pestañas 1 y 2 del registro (sección 2 del documento del proyecto).
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { validateLogin } from '../src/validation/loginForm.js';
import { isPersonalDataComplete, normalizePersonalData, validatePersonalData } from '../src/validation/personalDataForm.js';
import { normalizeVehicle, toVehicleForm, validateVehicle } from '../src/validation/vehicleForm.js';

const TODAY = new Date(2026, 10, 1);

const VALID_PERSONAL = {
  photoUri: 'file:///perfil.jpg',
  fullName: 'Laura Gómez Peña',
  documentNumber: '1020304050',
  phone: '3001234567',
  birthDate: '1995-06-20',
  gender: 'female',
  email: 'laura@correo.com',
  language: 'es',
};

const VALID_VEHICLE = {
  category: 'economy',
  plate: 'abc123',
  brand: 'Chevrolet',
  model: 'Onix',
  year: '2022',
  color: 'white',
  capacity: '4',
  photoUri: 'file:///vehiculo.jpg',
};

const errorKeys = (errors) => Object.fromEntries(Object.entries(errors).map(([field, error]) => [field, error.key]));

test('login: correo y contraseña obligatorios, correo con formato válido', () => {
  assert.deepEqual(errorKeys(validateLogin({ email: '', password: '' })), {
    email: 'validation.required',
    password: 'validation.required',
  });
  assert.deepEqual(errorKeys(validateLogin({ email: 'correo-sin-arroba', password: 'x' })), { email: 'validation.email' });
  assert.deepEqual(validateLogin({ email: 'a@b.co', password: 'x' }), {});
});

test('pestaña 1: datos válidos no tienen errores', () => {
  assert.deepEqual(validatePersonalData(VALID_PERSONAL, TODAY), {});
});

test('pestaña 1: ningún campo puede quedar vacío (ni con solo espacios)', () => {
  const empty = { photoUri: '', fullName: '   ', documentNumber: '', phone: '', birthDate: '', gender: '', email: '', language: 'es' };
  assert.deepEqual(Object.keys(validatePersonalData(empty, TODAY)).sort(), [
    'birthDate',
    'documentNumber',
    'email',
    'fullName',
    'gender',
    'phone',
    'photoUri',
  ]);
});

test('pestaña 1: nombre máximo 50 caracteres y solo letras y espacios', () => {
  const tooLong = validatePersonalData({ ...VALID_PERSONAL, fullName: 'A'.repeat(51) }, TODAY);
  assert.equal(tooLong.fullName.key, 'validation.maxLength');
  assert.deepEqual(tooLong.fullName.params, { max: 50 });
  assert.equal(validatePersonalData({ ...VALID_PERSONAL, fullName: 'Laura 2' }, TODAY).fullName.key, 'validation.lettersOnly');
});

test('pestaña 1: documento de 6 a 10 dígitos y celular de 10 dígitos', () => {
  assert.equal(validatePersonalData({ ...VALID_PERSONAL, documentNumber: '12345' }, TODAY).documentNumber.key, 'validation.digitsRange');
  assert.equal(validatePersonalData({ ...VALID_PERSONAL, documentNumber: '123456' }, TODAY).documentNumber, undefined);
  assert.equal(validatePersonalData({ ...VALID_PERSONAL, phone: '300123456' }, TODAY).phone.key, 'validation.digitsExact');
});

test('pestaña 1: el conductor debe tener al menos 18 años', () => {
  assert.equal(validatePersonalData({ ...VALID_PERSONAL, birthDate: '2008-11-02' }, TODAY).birthDate.key, 'validation.underage');
  assert.equal(validatePersonalData({ ...VALID_PERSONAL, birthDate: '2008-11-01' }, TODAY).birthDate, undefined);
  assert.equal(validatePersonalData({ ...VALID_PERSONAL, birthDate: '2030-01-01' }, TODAY).birthDate.key, 'validation.invalidDate');
});

test('pestaña 1: género de la lista, correo con @ y dominio, idioma es/en', () => {
  const errors = validatePersonalData({ ...VALID_PERSONAL, gender: 'x', email: 'laura@correo', language: 'fr' }, TODAY);
  assert.deepEqual(errorKeys(errors), {
    gender: 'validation.invalidOption',
    email: 'validation.email',
    language: 'validation.selectRequired',
  });
});

test('pestaña 1: normaliza espacios y correo antes de guardar', () => {
  const normalized = normalizePersonalData({ ...VALID_PERSONAL, fullName: '  Laura   Gómez ', email: ' Laura@Correo.com ' });
  assert.equal(normalized.fullName, 'Laura Gómez');
  assert.equal(normalized.email, 'laura@correo.com');
  assert.equal(isPersonalDataComplete(normalized, TODAY), true);
  assert.equal(isPersonalDataComplete(null, TODAY), false);
});

test('pestaña 2: datos válidos no tienen errores (placa en minúsculas incluida)', () => {
  assert.deepEqual(validateVehicle(VALID_VEHICLE, TODAY), {});
});

test('pestaña 2: placa con formato colombiano ABC123', () => {
  assert.equal(validateVehicle({ ...VALID_VEHICLE, plate: 'AB123C' }, TODAY).plate.key, 'validation.plate');
});

test('pestaña 2: marca y modelo máximo 30 caracteres', () => {
  const errors = validateVehicle({ ...VALID_VEHICLE, brand: 'B'.repeat(31), model: 'M'.repeat(31) }, TODAY);
  assert.equal(errors.brand.key, 'validation.maxLength');
  assert.equal(errors.model.key, 'validation.maxLength');
});

test('pestaña 2: año de 4 dígitos y no mayor al año actual', () => {
  assert.equal(validateVehicle({ ...VALID_VEHICLE, year: '22' }, TODAY).year.key, 'validation.yearFormat');
  assert.equal(validateVehicle({ ...VALID_VEHICLE, year: '2027' }, TODAY).year.key, 'validation.yearMax');
  assert.equal(validateVehicle({ ...VALID_VEHICLE, year: '2026' }, TODAY).year, undefined);
});

test('pestaña 2: XL exige capacidad mínima de 6 pasajeros', () => {
  assert.equal(validateVehicle({ ...VALID_VEHICLE, category: 'xl', capacity: '5' }, TODAY).capacity.key, 'validation.capacityXl');
  assert.equal(validateVehicle({ ...VALID_VEHICLE, category: 'xl', capacity: '6' }, TODAY).capacity, undefined);
  assert.equal(validateVehicle({ ...VALID_VEHICLE, capacity: '0' }, TODAY).capacity.key, 'validation.capacityMin');
});

test('pestaña 2: categoría y color deben ser de la lista; la foto es obligatoria', () => {
  const errors = validateVehicle({ ...VALID_VEHICLE, category: 'moto', color: '', photoUri: '' }, TODAY);
  assert.deepEqual(errorKeys(errors), {
    category: 'validation.invalidOption',
    color: 'validation.selectRequired',
    photoUri: 'validation.photoRequired',
  });
});

test('pestaña 2: se guarda la placa en mayúsculas y año/capacidad como números', () => {
  const normalized = normalizeVehicle(VALID_VEHICLE);
  assert.equal(normalized.plate, 'ABC123');
  assert.equal(normalized.year, 2022);
  assert.equal(normalized.capacity, 4);
  assert.deepEqual(toVehicleForm(normalized), { ...VALID_VEHICLE, plate: 'ABC123' });
});
