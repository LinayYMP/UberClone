// AI-assisted: see docs/AI_LOG.md #11
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import { updateLocation } from '../services/driverService';

// Cada cuánto se envía la ubicación a la base de datos mientras el conductor está Disponible.
export const LOCATION_PUBLISH_INTERVAL_MS = 5000;

export const LOCATION_PERMISSION = {
  UNKNOWN: 'unknown',
  GRANTED: 'granted',
  DENIED: 'denied',
};

// Ubicación del conductor. Mientras `watch` es true se sigue la posición del dispositivo; si además
// llega `publishFor` (id del conductor), se guarda en Firestore cada pocos segundos.
// La función de limpieza del useEffect detiene el seguimiento al pasar a No disponible o al salir
// de la pantalla (requisito del documento).
export default function useDriverLocation({ watch, publishFor = null }) {
  const [location, setLocation] = useState(null);
  const [permission, setPermission] = useState(LOCATION_PERMISSION.UNKNOWN);
  const [retryCount, setRetryCount] = useState(0);
  const latestLocation = useRef(null);

  useEffect(() => {
    if (!watch) {
      return undefined;
    }
    let subscription = null;
    let isCancelled = false;

    async function start() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (isCancelled) {
          return;
        }
        if (status !== 'granted') {
          setPermission(LOCATION_PERMISSION.DENIED);
          return;
        }
        setPermission(LOCATION_PERMISSION.GRANTED);
        const watcher = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
          (position) => {
            const point = { lat: position.coords.latitude, lng: position.coords.longitude };
            latestLocation.current = point;
            setLocation(point);
          },
        );
        // Si la pantalla se cerró mientras se pedía el permiso, se detiene de inmediato.
        if (isCancelled) {
          watcher.remove();
        } else {
          subscription = watcher;
        }
      } catch {
        if (!isCancelled) {
          setPermission(LOCATION_PERMISSION.DENIED);
        }
      }
    }

    start();
    return () => {
      isCancelled = true;
      subscription?.remove();
    };
  }, [watch, retryCount]);

  // Envío periódico a Firestore (aunque el conductor esté quieto). Se detiene en la limpieza.
  useEffect(() => {
    if (!watch || !publishFor) {
      return undefined;
    }
    const publish = () => {
      if (latestLocation.current) {
        updateLocation(publishFor, latestLocation.current).catch(() => undefined);
      }
    };
    publish();
    const timer = setInterval(publish, LOCATION_PUBLISH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [watch, publishFor]);

  const retry = useCallback(() => setRetryCount((count) => count + 1), []);

  return { location, permission, retry };
}
