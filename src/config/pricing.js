// AI-assisted: see docs/AI_LOG.md #11
// Único archivo con los valores de tarifa y comisión (sección 5 del documento del proyecto).
// Valores didácticos en pesos colombianos enteros; no son tarifas reales.
export const PRICING = {
  baseFare: 3500,
  perKm: 1200,
  perMinute: 250,
  minimumFare: 6000,
  categoryMultipliers: {
    economy: 1.0,
    xl: 1.4,
    premium: 1.8,
  },
  // La plataforma cobra el 20 % de la tarifa; las propinas van completas al conductor.
  commissionRate: 0.2,
  // La tarifa se redondea al múltiplo de 100 COP más cercano antes de calcular la comisión.
  roundingStep: 100,
};
