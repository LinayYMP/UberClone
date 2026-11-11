// AI-assisted: see docs/AI_LOG.md #11
import { useCallback, useEffect, useState } from 'react';

import { fetchTripHistory } from '../services/tripService';
import { isFinishedTrip } from '../utils/historyFilters.js';

const PAGE_SIZE = 20;
const INITIAL = { trips: [], cursor: null, hasMore: false, status: 'loading' };

// Historial paginado: carga 20 viajes y trae más al llegar al final de la lista.
// `filters` = { from, to, paymentMethod }. Al cambiar los filtros se empieza de nuevo; la limpieza
// descarta la respuesta de una búsqueda anterior que llegue tarde.
export default function useTripHistory(driverId, filters, enabled = true) {
  const [state, setState] = useState(INITIAL);
  const [reloadCount, setReloadCount] = useState(0);
  const { from, to, paymentMethod } = filters;
  const fromTime = from?.getTime() ?? null;
  const toTime = to?.getTime() ?? null;

  useEffect(() => {
    if (!enabled || !driverId) {
      return undefined;
    }
    let isActive = true;
    setState(INITIAL);
    fetchTripHistory(driverId, {
      from: fromTime ? new Date(fromTime) : null,
      to: toTime ? new Date(toTime) : null,
      paymentMethod,
      pageSize: PAGE_SIZE,
    })
      .then((page) => {
        if (isActive) {
          setState({ trips: page.trips.filter(isFinishedTrip), cursor: page.cursor, hasMore: page.hasMore, status: 'ready' });
        }
      })
      .catch(() => {
        if (isActive) {
          setState({ ...INITIAL, status: 'error' });
        }
      });
    return () => {
      isActive = false;
    };
  }, [driverId, enabled, fromTime, toTime, paymentMethod, reloadCount]);

  const loadMore = useCallback(async () => {
    if (state.status !== 'ready' || !state.hasMore) {
      return;
    }
    setState((current) => ({ ...current, status: 'loadingMore' }));
    try {
      const page = await fetchTripHistory(driverId, {
        from: fromTime ? new Date(fromTime) : null,
        to: toTime ? new Date(toTime) : null,
        paymentMethod,
        pageSize: PAGE_SIZE,
        cursor: state.cursor,
      });
      setState((current) => ({
        trips: [...current.trips, ...page.trips.filter(isFinishedTrip)],
        cursor: page.cursor,
        hasMore: page.hasMore,
        status: 'ready',
      }));
    } catch {
      setState((current) => ({ ...current, status: 'ready', hasMore: false }));
    }
  }, [driverId, fromTime, toTime, paymentMethod, state.status, state.hasMore, state.cursor]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  return { ...state, loadMore, reload };
}
