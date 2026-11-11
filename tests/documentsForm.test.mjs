// AI-assisted: see docs/AI_LOG.md #11
// Pestaña 3 — Documentos y pagos, y creación de la cuenta.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  isDocumentsComplete,
  normalizeDocuments,
  requiresTechnicalInspection,
  validateDocuments,
} from '../src/validation/documentsForm.js';
import { validateSignUp } from '../src/validation/signUpForm.js';

const TODAY = new Date(2026, 10, 10);
const VALID = {
  licenseNumber: 'abc12345',
  licensePhotoUri: 'file:///licencia.jpg',
  licenseExpiresAt: '2030-01-15',
  soatPhotoUri: 'file:///soat.jpg',
  soatExpiresAt: '2027-03-01',
  inspectionPhotoUri: 'file:///rtm.jpg',
  inspectionExpiresAt: '2027-05-20',
  mercadoPagoEmail: 'Pagos@Correo.com',
  termsAccepted: true,
};
const keys = (errors) => Object.keys(errors).sort();

test('la revisión técnico-mecánica aplica desde el quinto año del vehículo', () => {
  assert.equal(requiresTechnicalInspection(2022, TODAY), false);
  assert.equal(requiresTechnicalInspection(2021, TODAY), true);
  assert.equal(requiresTechnicalInspection('', TODAY), false);
});

test('documentos válidos no tienen errores', () => {
  assert.deepEqual(validateDocuments(VALID, { vehicleYear: 2018, today: TODAY }), {});
});

test('las fechas de vencimiento deben ser posteriores a hoy', () => {
  const errors = validateDocuments(
    { ...VALID, licenseExpiresAt: '2026-11-10', soatExpiresAt: '2025-12-31' },
    { vehicleYear: 2018, today: TODAY },
  );
  assert.equal(errors.licenseExpiresAt.key, 'validation.expired');
  assert.equal(errors.soatExpiresAt.key, 'validation.expired');
});

test('sin revisión aplicable no se exigen su foto ni su fecha', () => {
  const values = { ...VALID, inspectionPhotoUri: '', inspectionExpiresAt: '' };
  assert.deepEqual(validateDocuments(values, { vehicleYear: 2024, today: TODAY }), {});
  assert.deepEqual(keys(validateDocuments(values, { vehicleYear: 2015, today: TODAY })), [
    'inspectionExpiresAt',
    'inspectionPhotoUri',
  ]);
});

test('ningún campo vacío: licencia, fotos, fechas, correo y términos', () => {
  const errors = validateDocuments({ termsAccepted: false }, { vehicleYear: 2024, today: TODAY });
  assert.deepEqual(keys(errors), [
    'licenseExpiresAt',
    'licenseNumber',
    'licensePhotoUri',
    'mercadoPagoEmail',
    'soatExpiresAt',
    'soatPhotoUri',
    'termsAccepted',
  ]);
  assert.equal(errors.termsAccepted.key, 'validation.termsRequired');
});

test('correo de Mercado Pago con formato válido y número de licencia alfanumérico', () => {
  const errors = validateDocuments(
    { ...VALID, mercadoPagoEmail: 'pagos@correo', licenseNumber: 'AB-12' },
    { vehicleYear: 2018, today: TODAY },
  );
  assert.equal(errors.mercadoPagoEmail.key, 'validation.email');
  assert.equal(errors.licenseNumber.key, 'validation.licenseNumber');
});

test('normalizeDocuments guarda el porcentaje de comisión aceptado y limpia la revisión que no aplica', () => {
  const saved = normalizeDocuments(VALID, { vehicleYear: 2024, today: TODAY });
  assert.equal(saved.licenseNumber, 'ABC12345');
  assert.equal(saved.mercadoPagoEmail, 'pagos@correo.com');
  assert.equal(saved.commissionRateAccepted, 0.2);
  assert.equal(saved.inspectionPhotoUri, '');
  assert.equal(isDocumentsComplete(saved, 2024, TODAY), true);
  assert.equal(isDocumentsComplete(saved, 2015, TODAY), false);
});

test('crear cuenta: correo válido, contraseña de 6+ caracteres y confirmación igual', () => {
  assert.deepEqual(validateSignUp({ email: 'a@b.co', password: 'secreto1', confirmPassword: 'secreto1' }), {});
  const errors = validateSignUp({ email: 'a@b', password: '123', confirmPassword: '124' });
  assert.equal(errors.email.key, 'validation.email');
  assert.equal(errors.password.key, 'validation.passwordLength');
  assert.equal(errors.confirmPassword.key, 'validation.passwordMismatch');
});
