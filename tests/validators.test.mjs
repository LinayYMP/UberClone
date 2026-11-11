// AI-assisted: see docs/AI_LOG.md #1
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  isBlank,
  isColombianCarPlate,
  isDigitsBetween,
  isLettersAndSpaces,
  isValidEmail,
  keepDigits,
  normalizePlate,
  normalizeSpaces,
} from '../src/utils/validators.js';

test('isBlank trata null, undefined, vacío y solo espacios como vacíos', () => {
  for (const value of [null, undefined, '', '   ']) {
    assert.equal(isBlank(value), true);
  }
  assert.equal(isBlank('a'), false);
  assert.equal(isBlank(0), false);
});

test('normalizeSpaces recorta y deja un solo espacio entre palabras', () => {
  assert.equal(normalizeSpaces('  Ana   María  '), 'Ana María');
});

test('isLettersAndSpaces acepta tildes y ñ, rechaza números y símbolos', () => {
  assert.equal(isLettersAndSpaces('José Peña Núñez'), true);
  assert.equal(isLettersAndSpaces('Ana2'), false);
  assert.equal(isLettersAndSpaces('Ana-María'), false);
});

test('isDigitsBetween valida cantidad de dígitos', () => {
  assert.equal(isDigitsBetween('123456', 6, 10), true);
  assert.equal(isDigitsBetween('12345', 6, 10), false);
  assert.equal(isDigitsBetween('12345678901', 6, 10), false);
  assert.equal(isDigitsBetween('12345a', 6, 10), false);
});

test('keepDigits elimina todo lo que no sea número y luego recorta', () => {
  assert.equal(keepDigits('300-123 45.67'), '3001234567');
  assert.equal(keepDigits('300-123-4567-99', 10), '3001234567');
});

test('isValidEmail exige @ y dominio con extensión', () => {
  assert.equal(isValidEmail('conductor@uberclone.test'), true);
  assert.equal(isValidEmail('  ana.perez@correo.com.co '), true);
  assert.equal(isValidEmail('anacorreo.com'), false);
  assert.equal(isValidEmail('ana@correo'), false);
  assert.equal(isValidEmail('ana@.com'), false);
  assert.equal(isValidEmail('ana @correo.com'), false);
});

test('la placa se pasa a mayúsculas antes de validar el formato ABC123', () => {
  assert.equal(normalizePlate('abc-123'), 'ABC123');
  assert.equal(isColombianCarPlate('abc123'), true);
  assert.equal(isColombianCarPlate('ABC12D'), false);
  assert.equal(isColombianCarPlate('AB1234'), false);
  assert.equal(isColombianCarPlate('ABC1234'), false);
});
