// AI-assisted: see docs/AI_LOG.md #11
import { PRICING } from '../config/pricing.js';

const roundToStep = (value, step) => Math.round(value / step) * step;

// Función pura usada en la estimación (al crear la solicitud) y en el cierre del viaje.
// Ejemplo del documento: 8,5 km y 22 min en Económico -> fare 19.200, commission 3.840, driverEarnings 15.360.
export function calculateFare({ distanceKm, durationMin, category, tip = 0 }, pricing = PRICING) {
  const multiplier = pricing.categoryMultipliers[category];
  if (multiplier === undefined) {
    throw new Error(`Categoría desconocida: ${category}`);
  }

  const subtotal = pricing.baseFare + distanceKm * pricing.perKm + durationMin * pricing.perMinute;
  const fare = roundToStep(Math.max(subtotal * multiplier, pricing.minimumFare), pricing.roundingStep);
  const commission = Math.round(fare * pricing.commissionRate);
  const tipAmount = Math.max(0, Math.round(tip));

  return {
    fare,
    commission,
    tip: tipAmount,
    driverEarnings: fare - commission + tipAmount,
    // Se guarda en cada viaje para que un cambio futuro del porcentaje no altere el historial.
    commissionRate: pricing.commissionRate,
  };
}
