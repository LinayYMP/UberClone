// AI-assisted: see docs/AI_LOG.md #11
import { useEffect, useState } from 'react';

import { subscribeToIncomingRequest } from '../services/tripService';

// Solicitud entrante ofrecida al conductor. Solo escucha mientras `enabled` (Disponible y en la
// pantalla de Inicio); la limpieza cancela la suscripción en tiempo real de Firestore.
export default function useTripRequests(driverId, enabled) {
  const [request, setRequest] = useState(null);

  useEffect(() => {
    if (!enabled || !driverId) {
      return undefined;
    }
    const unsubscribe = subscribeToIncomingRequest(driverId, setRequest, () => setRequest(null));
    return () => {
      unsubscribe();
      setRequest(null);
    };
  }, [driverId, enabled]);

  return enabled ? request : null;
}
