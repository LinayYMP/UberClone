// AI-assisted: see docs/AI_LOG.md #11
// Viajes en Firestore (colección trips, modelo de datos de la sección 6). Cada cambio de estado pasa
// por canTransition para que el campo `status` solo avance por los caminos permitidos.
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { ACTIVE_TRIP_STATUSES, canTransition, PAYMENT_METHODS, PAYMENT_STATUS, TRIP_STATUS } from '../constants/trips.js';
import { calculateFare } from '../utils/calculateFare.js';
import { db } from './firebase/app.js';
import { ERROR_CODES, ServiceError, toServiceError, withTimeout } from './serviceError.js';

const tripsRef = collection(db, 'trips');
const tripRef = (tripId) => doc(db, 'trips', tripId);

const toDate = (value) => (value && typeof value.toDate === 'function' ? value.toDate() : value ?? null);
const DATE_FIELDS = ['createdAt', 'offeredAt', 'acceptedAt', 'arrivingAt', 'startedAt', 'completedAt', 'paidAt', 'cancelledAt'];

function fromSnapshot(snapshot) {
  const data = snapshot.data();
  const trip = { id: snapshot.id, ...data };
  for (const field of DATE_FIELDS) {
    trip[field] = toDate(data[field]);
  }
  return trip;
}

const newestFirst = (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);

function listen(target, onChange, onError) {
  return onSnapshot(target, onChange, (error) => onError?.(toServiceError(error)));
}

// Solicitud ofrecida a este conductor (la asigna el despachador del backend).
export function subscribeToIncomingRequest(driverId, onChange, onError) {
  const offers = query(tripsRef, where('offeredTo', '==', driverId), where('status', '==', TRIP_STATUS.REQUESTED));
  return listen(offers, (snapshot) => onChange(snapshot.docs.map(fromSnapshot).sort(newestFirst)[0] ?? null), onError);
}

// Viaje activo del conductor: aceptado, yendo a recoger, en curso o pendiente de cobro.
export function subscribeToActiveTrip(driverId, onChange, onError) {
  const active = query(tripsRef, where('driverId', '==', driverId), where('status', 'in', ACTIVE_TRIP_STATUSES));
  return listen(active, (snapshot) => onChange(snapshot.docs.map(fromSnapshot).sort(newestFirst)[0] ?? null), onError);
}

export function subscribeToTrip(tripId, onChange, onError) {
  return listen(tripRef(tripId), (snapshot) => onChange(snapshot.exists() ? fromSnapshot(snapshot) : null), onError);
}

// Todos los viajes del conductor: base de las ganancias y del saldo (useEarnings).
export function subscribeToDriverTrips(driverId, onChange, onError) {
  const trips = query(tripsRef, where('driverId', '==', driverId));
  return listen(trips, (snapshot) => onChange(snapshot.docs.map(fromSnapshot)), onError);
}

export async function getTrip(tripId) {
  const snapshot = await getDoc(tripRef(tripId));
  return snapshot.exists() ? fromSnapshot(snapshot) : null;
}

async function run(action) {
  try {
    return await withTimeout(action());
  } catch (error) {
    throw toServiceError(error);
  }
}

function assertTransition(trip, nextStatus) {
  if (!canTransition(trip.status, nextStatus)) {
    throw new ServiceError(ERROR_CODES.INVALID_TRANSITION);
  }
}

// Aceptar con una transacción: si otro proceso ya cambió la solicitud (venció el tiempo o se la
// ofrecieron a otro conductor), se rechaza en lugar de pisar el cambio.
export function acceptTrip(driverId, tripId) {
  return run(() =>
    runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(tripRef(tripId));
      const trip = snapshot.data();
      if (!snapshot.exists() || trip.status !== TRIP_STATUS.REQUESTED || trip.offeredTo !== driverId) {
        throw new ServiceError(ERROR_CODES.TRIP_UNAVAILABLE);
      }
      transaction.update(tripRef(tripId), {
        status: TRIP_STATUS.ACCEPTED,
        driverId,
        offeredTo: null,
        acceptedAt: serverTimestamp(),
      });
    }),
  );
}

// Rechazar o dejar vencer los 15 segundos: la solicitud vuelve al despachador, que la ofrece al
// siguiente conductor disponible o la deja en "rejected" si no hay ninguno.
export function rejectTrip(driverId, tripId, reason) {
  return run(() =>
    runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(tripRef(tripId));
      const trip = snapshot.data();
      if (!snapshot.exists() || trip.status !== TRIP_STATUS.REQUESTED || trip.offeredTo !== driverId) {
        return;
      }
      transaction.update(tripRef(tripId), {
        offeredTo: null,
        rejectedDriverIds: arrayUnion(driverId),
        lastRejection: { driverId, reason },
      });
    }),
  );
}

// Ruta hacia el punto de recogida calculada al aceptar.
export function markDriverArriving(trip, pickupRoute) {
  assertTransition(trip, TRIP_STATUS.DRIVER_ARRIVING);
  return run(() =>
    updateDoc(tripRef(trip.id), {
      status: TRIP_STATUS.DRIVER_ARRIVING,
      pickupRoute: pickupRoute?.path ?? null,
      pickupDistanceKm: pickupRoute?.distanceKm ?? null,
      pickupDurationMin: pickupRoute?.durationMin ?? null,
      arrivingAt: serverTimestamp(),
    }),
  );
}

// "Pasajero a bordo": la ruta cambia hacia el destino.
export function markPassengerOnBoard(trip) {
  assertTransition(trip, TRIP_STATUS.IN_PROGRESS);
  return run(() => updateDoc(tripRef(trip.id), { status: TRIP_STATUS.IN_PROGRESS, startedAt: serverTimestamp() }));
}

// Finalizar: la tarifa final se calcula con la misma función de la estimación y se guarda la
// comisión aplicada para que un cambio futuro del porcentaje no altere el historial.
export function completeTrip(trip) {
  assertTransition(trip, TRIP_STATUS.COMPLETED);
  const { fare, commission, tip, driverEarnings, commissionRate } = calculateFare({
    distanceKm: trip.distanceKm,
    durationMin: trip.durationMin,
    category: trip.category,
    tip: trip.tip ?? 0,
  });
  return run(() =>
    updateDoc(tripRef(trip.id), {
      status: TRIP_STATUS.COMPLETED,
      fare,
      commission,
      tip,
      driverEarnings,
      commissionRate,
      paymentStatus: PAYMENT_STATUS.PENDING,
      completedAt: serverTimestamp(),
    }),
  );
}

// Cancelar solo es posible antes de que el pasajero suba.
export function cancelTrip(trip) {
  assertTransition(trip, TRIP_STATUS.CANCELLED);
  return run(() =>
    updateDoc(tripRef(trip.id), { status: TRIP_STATUS.CANCELLED, cancelledBy: 'driver', cancelledAt: serverTimestamp() }),
  );
}

// Efectivo: el conductor marca el cobro como recibido. La comisión se descuenta de su saldo.
export function confirmCashPayment(trip) {
  assertTransition(trip, TRIP_STATUS.PAID);
  if (trip.paymentMethod !== PAYMENT_METHODS.CASH) {
    throw new ServiceError(ERROR_CODES.INVALID_TRANSITION);
  }
  return run(() =>
    updateDoc(tripRef(trip.id), { status: TRIP_STATUS.PAID, paymentStatus: PAYMENT_STATUS.CASH, paidAt: serverTimestamp() }),
  );
}

// Calificación del pasajero, de 1 a 5.
export function rateTrip(tripId, rating) {
  return run(() => updateDoc(tripRef(tripId), { rating }));
}

// Historial paginado (20 por carga), del más reciente al más antiguo.
// filters: { from: Date|null, to: Date|null, paymentMethod: string|null }
export async function fetchTripHistory(driverId, { from, to, paymentMethod, cursor, pageSize = 20 }) {
  const constraints = [where('driverId', '==', driverId)];
  if (paymentMethod) {
    constraints.push(where('paymentMethod', '==', paymentMethod));
  }
  if (from) {
    constraints.push(where('createdAt', '>=', Timestamp.fromDate(from)));
  }
  if (to) {
    constraints.push(where('createdAt', '<=', Timestamp.fromDate(to)));
  }
  constraints.push(orderBy('createdAt', 'desc'), limit(pageSize));
  if (cursor) {
    constraints.push(startAfter(cursor));
  }
  try {
    const snapshot = await withTimeout(getDocs(query(tripsRef, ...constraints)));
    return {
      trips: snapshot.docs.map(fromSnapshot),
      cursor: snapshot.docs.at(-1) ?? null,
      hasMore: snapshot.docs.length === pageSize,
    };
  } catch (error) {
    throw toServiceError(error);
  }
}
