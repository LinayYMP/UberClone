// AI-assisted: see docs/AI_LOG.md #11
// Filtros del historial (sección 6): Hoy, Semana, Mes y Rango de fechas, más método de pago.
import { FINISHED_TRIP_STATUSES } from '../constants/trips.js';
import { parseISODate } from './dates.js';
import { getPeriodStart } from './earnings.js';

export const HISTORY_PERIODS = ['today', 'week', 'month', 'range'];

// Convierte el filtro en { from, to } para la consulta. En "range" se incluye el día final completo.
export function resolveHistoryRange(period, range = {}, now = new Date()) {
  if (period !== 'range') {
    return { from: getPeriodStart(period, now), to: null };
  }
  const from = parseISODate(range.from);
  const toDay = parseISODate(range.to);
  const to = toDay ? new Date(toDay.getFullYear(), toDay.getMonth(), toDay.getDate(), 23, 59, 59, 999) : null;
  return { from, to };
}

// El rango es válido si tiene ambas fechas y la inicial no es posterior a la final.
export function isValidRange(range = {}) {
  const from = parseISODate(range.from);
  const to = parseISODate(range.to);
  return Boolean(from && to && from <= to);
}

// En el historial solo se listan carreras terminadas (no la solicitud ni el viaje en curso).
export const isFinishedTrip = (trip) => FINISHED_TRIP_STATUSES.includes(trip.status);
