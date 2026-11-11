// AI-assisted: see docs/AI_LOG.md #11
// Estados de un viaje (sección 3 del documento). Se guardan en el campo `status` y controlan qué
// pantalla ve el conductor. "rejected" es el caso en que ningún conductor aceptó la solicitud.
export const TRIP_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  DRIVER_ARRIVING: 'driver_arriving',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
};

// Transiciones permitidas. Cancelar solo es posible antes de que el pasajero suba (in_progress).
export const TRIP_TRANSITIONS = {
  [TRIP_STATUS.REQUESTED]: [TRIP_STATUS.ACCEPTED, TRIP_STATUS.REQUESTED, TRIP_STATUS.REJECTED, TRIP_STATUS.CANCELLED],
  [TRIP_STATUS.ACCEPTED]: [TRIP_STATUS.DRIVER_ARRIVING, TRIP_STATUS.CANCELLED],
  [TRIP_STATUS.DRIVER_ARRIVING]: [TRIP_STATUS.IN_PROGRESS, TRIP_STATUS.CANCELLED],
  [TRIP_STATUS.IN_PROGRESS]: [TRIP_STATUS.COMPLETED],
  [TRIP_STATUS.COMPLETED]: [TRIP_STATUS.PAID],
  [TRIP_STATUS.PAID]: [],
  [TRIP_STATUS.CANCELLED]: [],
  [TRIP_STATUS.REJECTED]: [],
};

export const canTransition = (from, to) => (TRIP_TRANSITIONS[from] ?? []).includes(to);

// Estados en los que el viaje ocupa al conductor (se muestra la pantalla de viaje o de cobro).
export const ACTIVE_TRIP_STATUSES = [
  TRIP_STATUS.ACCEPTED,
  TRIP_STATUS.DRIVER_ARRIVING,
  TRIP_STATUS.IN_PROGRESS,
  TRIP_STATUS.COMPLETED,
];

// Estados que aparecen en el historial de carreras.
export const FINISHED_TRIP_STATUSES = [TRIP_STATUS.COMPLETED, TRIP_STATUS.PAID, TRIP_STATUS.CANCELLED];

export const PAYMENT_METHODS = {
  MERCADOPAGO: 'mercadopago',
  STRIPE: 'stripe',
  CASH: 'cash',
};

// Estado del pago que ve el conductor: Aprobado, Pendiente, Rechazado o Efectivo.
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CASH: 'cash',
};

// Tiempo límite para aceptar o rechazar una solicitud entrante.
export const REQUEST_TIMEOUT_SECONDS = 15;
