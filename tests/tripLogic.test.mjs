// AI-assisted: see docs/AI_LOG.md #11
// Tarifa (sección 5), estados del viaje (sección 3), ganancias y rutas.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { canTransition, PAYMENT_METHODS, TRIP_STATUS } from '../src/constants/trips.js';
import { calculateFare } from '../src/utils/calculateFare.js';
import { calculateBalance, formatCOP, getPeriodStart, summarizeEarnings } from '../src/utils/earnings.js';
import { decodePolyline, haversineKm, simplifyPath } from '../src/utils/geo.js';

test('calculateFare reproduce el ejemplo del documento (8,5 km, 22 min)', () => {
  assert.deepEqual(calculateFare({ distanceKm: 8.5, durationMin: 22, category: 'economy' }), {
    fare: 19200,
    commission: 3840,
    tip: 0,
    driverEarnings: 15360,
    commissionRate: 0.2,
  });
  const xl = calculateFare({ distanceKm: 8.5, durationMin: 22, category: 'xl' });
  assert.equal(xl.fare, 26900); // 26.880 redondeado al múltiplo de 100
  assert.equal(xl.commission, 5380);
  assert.equal(xl.driverEarnings, 21520);
});

test('calculateFare aplica la tarifa mínima y suma la propina completa al conductor', () => {
  const short = calculateFare({ distanceKm: 0.5, durationMin: 2, category: 'economy', tip: 2000 });
  assert.equal(short.fare, 6000);
  assert.equal(short.commission, 1200);
  assert.equal(short.driverEarnings, 6000 - 1200 + 2000);
  assert.throws(() => calculateFare({ distanceKm: 1, durationMin: 1, category: 'moto' }));
});

test('los estados del viaje solo avanzan por transiciones válidas', () => {
  assert.equal(canTransition(TRIP_STATUS.REQUESTED, TRIP_STATUS.ACCEPTED), true);
  assert.equal(canTransition(TRIP_STATUS.ACCEPTED, TRIP_STATUS.DRIVER_ARRIVING), true);
  assert.equal(canTransition(TRIP_STATUS.DRIVER_ARRIVING, TRIP_STATUS.IN_PROGRESS), true);
  assert.equal(canTransition(TRIP_STATUS.IN_PROGRESS, TRIP_STATUS.COMPLETED), true);
  assert.equal(canTransition(TRIP_STATUS.COMPLETED, TRIP_STATUS.PAID), true);
  // Cancelar solo antes de que el pasajero suba.
  assert.equal(canTransition(TRIP_STATUS.DRIVER_ARRIVING, TRIP_STATUS.CANCELLED), true);
  assert.equal(canTransition(TRIP_STATUS.IN_PROGRESS, TRIP_STATUS.CANCELLED), false);
  assert.equal(canTransition(TRIP_STATUS.PAID, TRIP_STATUS.COMPLETED), false);
});

test('getPeriodStart: hoy, lunes de la semana y día 1 del mes', () => {
  const wednesday = new Date(2026, 10, 11, 15, 30); // miércoles 11 de noviembre de 2026
  assert.deepEqual(getPeriodStart('today', wednesday), new Date(2026, 10, 11));
  assert.deepEqual(getPeriodStart('week', wednesday), new Date(2026, 10, 9));
  assert.deepEqual(getPeriodStart('month', wednesday), new Date(2026, 10, 1));
  const sunday = new Date(2026, 10, 15, 9);
  assert.deepEqual(getPeriodStart('week', sunday), new Date(2026, 10, 9));
});

const NOW = new Date(2026, 10, 11, 18);
const paidTrip = (day, values) => ({
  status: TRIP_STATUS.PAID,
  completedAt: new Date(2026, 10, day, 10),
  paymentMethod: PAYMENT_METHODS.MERCADOPAGO,
  tip: 0,
  ...values,
});
const TRIPS = [
  paidTrip(11, { fare: 19200, commission: 3840, driverEarnings: 15360 }),
  paidTrip(11, { fare: 10000, commission: 2000, tip: 1000, driverEarnings: 9000, paymentMethod: PAYMENT_METHODS.CASH }),
  paidTrip(10, { fare: 6000, commission: 1200, driverEarnings: 4800 }),
  paidTrip(2, { fare: 26900, commission: 5380, driverEarnings: 21520 }),
  { status: TRIP_STATUS.CANCELLED, completedAt: new Date(2026, 10, 11), fare: 99999, commission: 1, driverEarnings: 1 },
];

test('summarizeEarnings cuenta solo viajes pagados del periodo', () => {
  assert.deepEqual(summarizeEarnings(TRIPS, 'today', NOW), {
    tripCount: 2,
    totalFare: 29200,
    totalCommission: 5840,
    totalTips: 1000,
    netEarnings: 24360,
    averagePerTrip: 12180,
  });
  assert.equal(summarizeEarnings(TRIPS, 'week', NOW).tripCount, 3);
  assert.equal(summarizeEarnings(TRIPS, 'month', NOW).netEarnings, 15360 + 9000 + 4800 + 21520);
  assert.equal(summarizeEarnings([], 'month', NOW).averagePerTrip, 0);
});

test('calculateBalance: ganancias por pasarela menos comisiones en efectivo', () => {
  assert.equal(calculateBalance(TRIPS), 15360 + 4800 + 21520 - 2000);
  assert.equal(calculateBalance([paidTrip(1, { commission: 1200, driverEarnings: 4800, paymentMethod: 'cash' })]), -1200);
});

test('formatCOP usa punto de miles y signo negativo', () => {
  assert.equal(formatCOP(15360), '$ 15.360');
  assert.equal(formatCOP(-1200), '-$ 1.200');
  assert.equal(formatCOP(0), '$ 0');
});

test('decodePolyline decodifica el ejemplo de Google', () => {
  assert.deepEqual(decodePolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@'), [
    { lat: 38.5, lng: -120.2 },
    { lat: 40.7, lng: -120.95 },
    { lat: 43.252, lng: -126.453 },
  ]);
});

test('haversineKm y simplifyPath', () => {
  const medellin = { lat: 6.2442, lng: -75.5812 };
  const envigado = { lat: 6.1759, lng: -75.5917 };
  assert.ok(Math.abs(haversineKm(medellin, envigado) - 7.68) < 0.1);
  const path = Array.from({ length: 1000 }, (_, i) => ({ lat: i, lng: i }));
  const simple = simplifyPath(path, 100);
  assert.equal(simple.length, 100);
  assert.deepEqual(simple[0], path[0]);
  assert.deepEqual(simple[99], path[999]);
});
