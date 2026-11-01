// AI-assisted: see docs/AI_LOG.md #1
import assert from 'node:assert/strict';
import { test } from 'node:test';

import en from '../src/i18n/en.js';
import es from '../src/i18n/es.js';
import { translate } from '../src/i18n/index.js';

function flattenKeys(node, prefix = '') {
  return Object.entries(node).flatMap(([key, value]) =>
    typeof value === 'object' ? flattenKeys(value, `${prefix}${key}.`) : [`${prefix}${key}`],
  );
}

test('español e inglés tienen exactamente las mismas claves', () => {
  assert.deepEqual(flattenKeys(en).sort(), flattenKeys(es).sort());
});

test('translate reemplaza parámetros y usa el idioma pedido', () => {
  assert.equal(translate('es', 'validation.maxLength', { max: 50 }), 'Máximo 50 caracteres.');
  assert.equal(translate('en', 'validation.maxLength', { max: 30 }), 'Maximum 30 characters.');
});

test('translate devuelve la clave si no existe y usa español para idiomas desconocidos', () => {
  assert.equal(translate('es', 'no.existe'), 'no.existe');
  assert.equal(translate('fr', 'common.retry'), 'Reintentar');
});
