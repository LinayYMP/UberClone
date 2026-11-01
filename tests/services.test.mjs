// AI-assisted: see docs/AI_LOG.md #1
// Servicios contra el servidor simulado (sin espera de red).
import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';

import { restoreSession, signIn } from '../src/services/authService.js';
import { getDriverRegistration, savePersonalData, saveVehicle } from '../src/services/driverService.js';
import { resetMockServer } from '../src/services/mock/mockServer.js';
import { SEED_DRIVERS } from '../src/services/mock/seedDrivers.js';

const ACCOUNT = SEED_DRIVERS[0];

beforeEach(() => {
  resetMockServer({ latency: 0 });
});

test('signIn devuelve la sesión con credenciales correctas (correo sin importar mayúsculas)', async () => {
  const session = await signIn({ email: `  ${ACCOUNT.email.toUpperCase()} `, password: ACCOUNT.password });
  assert.equal(session.driverId, ACCOUNT.id);
  assert.equal(session.email, ACCOUNT.email);
  assert.ok(session.token);
  assert.equal('password' in session, false);
});

test('signIn usa el mismo error para contraseña incorrecta y correo inexistente', async () => {
  await assert.rejects(signIn({ email: ACCOUNT.email, password: 'otra' }), { code: 'invalid-credentials' });
  await assert.rejects(signIn({ email: 'nadie@correo.com', password: ACCOUNT.password }), { code: 'invalid-credentials' });
});

test('restoreSession acepta una sesión válida y descarta una inválida', async () => {
  const session = await signIn({ email: ACCOUNT.email, password: ACCOUNT.password });
  assert.deepEqual(await restoreSession(session), session);
  assert.equal(await restoreSession({ driverId: 'drv_999', token: 'x' }), null);
  assert.equal(await restoreSession(null), null);
});

test('el registro nuevo empieza incompleto y nunca expone la contraseña', async () => {
  const registration = await getDriverRegistration(ACCOUNT.id);
  assert.equal(registration.accountStatus, 'incomplete');
  assert.equal(registration.personalData, null);
  assert.equal(JSON.stringify(registration).includes(ACCOUNT.password), false);
});

test('savePersonalData guarda los datos normalizados', async () => {
  const registration = await savePersonalData(ACCOUNT.id, {
    photoUri: 'file:///perfil.jpg',
    fullName: '  Laura   Gómez ',
    documentNumber: '1020304050',
    phone: '3001234567',
    birthDate: '1995-06-20',
    gender: 'female',
    email: 'Laura@Correo.com',
    language: 'en',
  });
  assert.equal(registration.personalData.fullName, 'Laura Gómez');
  assert.equal(registration.personalData.email, 'laura@correo.com');
  assert.deepEqual((await getDriverRegistration(ACCOUNT.id)).personalData, registration.personalData);
});

test('el servidor rechaza datos inválidos aunque la app no los haya validado', async () => {
  await assert.rejects(saveVehicle(ACCOUNT.id, { category: 'xl', capacity: '4' }), { code: 'validation' });
});

test('saveVehicle guarda placa en mayúsculas y números enteros', async () => {
  const registration = await saveVehicle(ACCOUNT.id, {
    category: 'xl',
    plate: 'xyz789',
    brand: 'Kia',
    model: 'Carnival',
    year: '2023',
    color: 'black',
    capacity: '7',
    photoUri: 'file:///vehiculo.jpg',
  });
  assert.equal(registration.vehicle.plate, 'XYZ789');
  assert.equal(registration.vehicle.capacity, 7);
});

test('un conductor inexistente produce not-found', async () => {
  await assert.rejects(getDriverRegistration('drv_999'), { code: 'not-found' });
});
