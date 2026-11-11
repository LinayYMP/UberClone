// AI-assisted: see docs/AI_LOG.md #11
// Cálculos de ganancias (sección 5). Funciones puras: el hook useEarnings las envuelve en useMemo.
import { PAYMENT_METHODS, TRIP_STATUS } from '../constants/trips.js';

export const EARNINGS_PERIODS = ['today', 'week', 'month'];

// Inicio del periodo: hoy a las 00:00, lunes de esta semana o día 1 del mes.
export function getPeriodStart(period, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === 'week') {
    const daysSinceMonday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - daysSinceMonday);
  } else if (period === 'month') {
    start.setDate(1);
  }
  return start;
}

// Fecha desde la que hay que traer viajes para poder calcular los tres periodos.
export const getEarliestPeriodStart = (now = new Date()) =>
  new Date(Math.min(getPeriodStart('week', now).getTime(), getPeriodStart('month', now).getTime()));

const isPaid = (trip) => trip.status === TRIP_STATUS.PAID;
const sumBy = (trips, field) => trips.reduce((total, trip) => total + (trip[field] ?? 0), 0);

// Resumen de un periodo: viajes, facturado, comisiones, propinas, ganancia neta y promedio.
export function summarizeEarnings(trips, period, now = new Date()) {
  const start = getPeriodStart(period, now);
  const inPeriod = trips.filter((trip) => isPaid(trip) && trip.completedAt && trip.completedAt >= start);
  const tripCount = inPeriod.length;
  const netEarnings = sumBy(inPeriod, 'driverEarnings');

  return {
    tripCount,
    totalFare: sumBy(inPeriod, 'fare'),
    totalCommission: sumBy(inPeriod, 'commission'),
    totalTips: sumBy(inPeriod, 'tip'),
    netEarnings,
    averagePerTrip: tripCount > 0 ? Math.round(netEarnings / tripCount) : 0,
  };
}

// Saldo del conductor: ganancias de viajes pagados por la pasarela menos las comisiones de los
// viajes en efectivo (la plataforma no recibió ese dinero). Puede quedar en negativo.
export function calculateBalance(trips) {
  return trips.filter(isPaid).reduce((balance, trip) => {
    if (trip.paymentMethod === PAYMENT_METHODS.CASH) {
      return balance - (trip.commission ?? 0);
    }
    return balance + (trip.driverEarnings ?? 0);
  }, 0);
}

// 15360 -> "$ 15.360"
export function formatCOP(value) {
  const sign = value < 0 ? '-' : '';
  const digits = String(Math.abs(Math.round(value))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}$ ${digits}`;
}
