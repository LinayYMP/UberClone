// AI-assisted: see docs/AI_LOG.md #11
import { useCallback, useEffect, useMemo, useState } from 'react';

import { subscribeToDriverTrips } from '../services/tripService';
import { calculateBalance, EARNINGS_PERIODS, summarizeEarnings } from '../utils/earnings.js';

// Ganancias de hoy, la semana y el mes, y saldo del conductor. Los viajes llegan en tiempo real
// y los totales se calculan con useMemo sobre ese historial (requisito del documento).
export default function useEarnings(driverId) {
  const [trips, setTrips] = useState([]);
  const [status, setStatus] = useState('loading');
  const [reloadCount, setReloadCount] = useState(0);

  // Suscripción en tiempo real; la limpieza la cancela al salir de la pantalla.
  useEffect(() => {
    if (!driverId) {
      return undefined;
    }
    return subscribeToDriverTrips(
      driverId,
      (list) => {
        setTrips(list);
        setStatus('ready');
      },
      () => setStatus('error'),
    );
  }, [driverId, reloadCount]);

  const reload = useCallback(() => {
    setStatus('loading');
    setReloadCount((count) => count + 1);
  }, []);

  const summaries = useMemo(() => {
    const now = new Date();
    return Object.fromEntries(EARNINGS_PERIODS.map((period) => [period, summarizeEarnings(trips, period, now)]));
  }, [trips]);

  const balance = useMemo(() => calculateBalance(trips), [trips]);

  return { summaries, balance, status, reload };
}
