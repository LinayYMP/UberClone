// AI-assisted: see docs/AI_LOG.md #11
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { TRIP_STATUS } from '../constants/trips.js';
import { startMercadoPagoCheckout } from '../services/paymentService';
import { getRoute } from '../services/routingService.js';
import * as tripService from '../services/tripService';
import { useRegistration } from './RegistrationContext.js';

// Viaje activo del conductor compartido con useContext (requisito del proyecto). Su `status` decide
// qué pantalla se ve: Inicio, Viaje en curso o Cobro y resumen (ver TripFlowNavigator).
const TripContext = createContext(null);

export function TripProvider({ children }) {
  const { driverId } = useRegistration();
  const [activeTrip, setActiveTrip] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  // Viaje cuyo resumen se muestra: sigue visible después de pagado, hasta que el conductor toca "Listo".
  const [summaryTripId, setSummaryTripId] = useState(null);
  const [summaryTrip, setSummaryTrip] = useState(null);
  const [notice, setNotice] = useState(null);
  const lastActiveTripId = useRef(null);

  // Suscripción en tiempo real al viaje activo. La limpieza la cancela al cerrar sesión.
  useEffect(() => {
    if (!driverId) {
      return undefined;
    }
    const unsubscribe = tripService.subscribeToActiveTrip(
      driverId,
      (trip) => {
        setActiveTrip(trip);
        setIsLoaded(true);
        if (trip?.status === TRIP_STATUS.COMPLETED) {
          setSummaryTripId(trip.id);
        }
        // El viaje dejó de estar activo sin pasar por el cobro: se averigua si lo cancelaron.
        const previousId = lastActiveTripId.current;
        lastActiveTripId.current = trip?.id ?? null;
        if (previousId && !trip) {
          tripService
            .getTrip(previousId)
            .then((finished) => {
              if (finished?.status === TRIP_STATUS.CANCELLED) {
                setNotice(finished.cancelledBy === 'driver' ? 'trip.cancelledByDriver' : 'trip.cancelledByPassenger');
              }
            })
            .catch(() => undefined);
        }
      },
      () => setIsLoaded(true),
    );
    return unsubscribe;
  }, [driverId]);

  // El resumen escucha su viaje por id para ver el cambio a "paid" que hace el backend.
  useEffect(() => {
    if (!summaryTripId) {
      setSummaryTrip(null);
      return undefined;
    }
    return tripService.subscribeToTrip(summaryTripId, setSummaryTrip);
  }, [summaryTripId]);

  // Al aceptar: una sola consulta de ruta hacia el punto de recogida y paso a "driver_arriving".
  // Si la ruta falla, el viaje sigue igual (sin línea en el mapa).
  const goToPickup = useCallback(async (trip, driverLocation) => {
    const route = driverLocation ? await getRoute(driverLocation, trip.origin).catch(() => null) : null;
    await tripService.markDriverArriving(trip, route);
  }, []);

  const markPassengerOnBoard = useCallback((trip) => tripService.markPassengerOnBoard(trip), []);
  const finishTrip = useCallback((trip) => tripService.completeTrip(trip), []);
  const cancelTrip = useCallback((trip) => tripService.cancelTrip(trip), []);
  const confirmCashPayment = useCallback((trip) => tripService.confirmCashPayment(trip), []);
  const payWithMercadoPago = useCallback((trip) => startMercadoPagoCheckout(trip), []);
  const ratePassenger = useCallback((tripId, rating) => tripService.rateTrip(tripId, rating), []);
  const dismissSummary = useCallback(() => setSummaryTripId(null), []);
  const clearNotice = useCallback(() => setNotice(null), []);

  const value = useMemo(
    () => ({
      activeTrip,
      summaryTrip: summaryTripId ? (summaryTrip ?? activeTrip) : null,
      isLoaded,
      notice,
      goToPickup,
      markPassengerOnBoard,
      finishTrip,
      cancelTrip,
      confirmCashPayment,
      payWithMercadoPago,
      ratePassenger,
      dismissSummary,
      clearNotice,
    }),
    [
      activeTrip,
      summaryTripId,
      summaryTrip,
      isLoaded,
      notice,
      goToPickup,
      markPassengerOnBoard,
      finishTrip,
      cancelTrip,
      confirmCashPayment,
      payWithMercadoPago,
      ratePassenger,
      dismissSummary,
      clearNotice,
    ],
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip debe usarse dentro de TripProvider');
  }
  return context;
}
