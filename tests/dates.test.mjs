// AI-assisted: see docs/AI_LOG.md #1
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { calculateAge, formatDisplayDate, latestBirthDateForAge, parseISODate, toISODate } from '../src/utils/dates.js';

test('parseISODate rechaza fechas que no existen', () => {
  assert.equal(parseISODate('2024-02-30'), null);
  assert.equal(parseISODate('15/03/1990'), null);
  assert.equal(toISODate(parseISODate('2024-02-29')), '2024-02-29');
});

test('calculateAge cuenta los años cumplidos según el cumpleaños', () => {
  const today = new Date(2026, 10, 1); // 1 de noviembre de 2026
  assert.equal(calculateAge(new Date(2008, 10, 1), today), 18); // cumple hoy
  assert.equal(calculateAge(new Date(2008, 10, 2), today), 17); // cumple mañana
  assert.equal(calculateAge(new Date(1990, 0, 15), today), 36);
});

test('latestBirthDateForAge devuelve la fecha límite para tener 18 años', () => {
  assert.equal(toISODate(latestBirthDateForAge(18, new Date(2026, 10, 1))), '2008-11-01');
  // 29 de febrero en año bisiesto -> 28 de febrero del año no bisiesto
  assert.equal(toISODate(latestBirthDateForAge(18, new Date(2028, 1, 29))), '2010-02-28');
});

test('formatDisplayDate usa el orden de cada idioma', () => {
  assert.equal(formatDisplayDate('1990-03-14', 'es'), '14/03/1990');
  assert.equal(formatDisplayDate('1990-03-14', 'en'), '03/14/1990');
  assert.equal(formatDisplayDate('', 'es'), '');
});
