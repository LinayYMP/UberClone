// AI-assisted: see docs/AI_LOG.md #11
// Ruta, distancia y duración entre dos puntos. Con EXPO_PUBLIC_GOOGLE_MAPS_API_KEY usa Google
// Directions; sin ella usa OSRM (gratis, alternativa que menciona el documento para ahorrar cupo).
// Se llama una vez al crear la solicitud y otra al aceptarla, nunca en cada movimiento.
import { decodePolyline, simplifyPath } from '../utils/geo.js';
import { ERROR_CODES, ServiceError, toServiceError } from './serviceError.js';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';
const TIMEOUT_MS = 10000;

export const ROUTING_PROVIDER = GOOGLE_MAPS_API_KEY ? 'google' : 'osrm';

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new ServiceError(ERROR_CODES.ROUTE_NOT_FOUND);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

const toResult = (meters, seconds, path) => ({
  distanceKm: Math.round(meters / 100) / 10,
  durationMin: Math.max(1, Math.round(seconds / 60)),
  path: simplifyPath(path),
});

async function getOsrmRoute(origin, destination) {
  const data = await fetchJson(
    `${OSRM_URL}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`,
  );
  const route = data.routes?.[0];
  if (!route) {
    throw new ServiceError(ERROR_CODES.ROUTE_NOT_FOUND);
  }
  return toResult(route.distance, route.duration, route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })));
}

async function getGoogleRoute(origin, destination) {
  const params = new URLSearchParams({
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    mode: 'driving',
    key: GOOGLE_MAPS_API_KEY,
  });
  const data = await fetchJson(`https://maps.googleapis.com/maps/api/directions/json?${params}`);
  const route = data.routes?.[0];
  const leg = route?.legs?.[0];
  if (data.status !== 'OK' || !leg) {
    throw new ServiceError(ERROR_CODES.ROUTE_NOT_FOUND);
  }
  return toResult(leg.distance.value, leg.duration.value, decodePolyline(route.overview_polyline.points));
}

// Devuelve { distanceKm, durationMin, path: [{ lat, lng }] }.
export async function getRoute(origin, destination) {
  try {
    return GOOGLE_MAPS_API_KEY ? await getGoogleRoute(origin, destination) : await getOsrmRoute(origin, destination);
  } catch (error) {
    throw toServiceError(error);
  }
}
