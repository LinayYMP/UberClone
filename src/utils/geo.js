// AI-assisted: see docs/AI_LOG.md #11
// Utilidades de coordenadas. Los puntos se manejan como { lat, lng } (modelo de datos) y se
// convierten a { latitude, longitude } solo para react-native-maps.

const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees) => (degrees * Math.PI) / 180;

// Distancia en línea recta entre dos puntos (fórmula de haversine).
export function haversineKm(a, b) {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export const toLatLng = (point) => ({ latitude: point.lat, longitude: point.lng });

// Región del mapa que contiene todos los puntos, con un margen.
export function regionForPoints(points, padding = 1.4) {
  const valid = points.filter(Boolean);
  if (valid.length === 0) {
    return null;
  }
  const lats = valid.map((point) => point.lat);
  const lngs = valid.map((point) => point.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * padding, 0.01),
    longitudeDelta: Math.max((maxLng - minLng) * padding, 0.01),
  };
}

// Decodifica una polilínea codificada de Google (Directions API) a puntos { lat, lng }.
export function decodePolyline(encoded) {
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    for (const axis of ['lat', 'lng']) {
      let result = 0;
      let shift = 0;
      let byte;
      do {
        byte = encoded.charCodeAt(index) - 63;
        index += 1;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (axis === 'lat') {
        lat += delta;
      } else {
        lng += delta;
      }
    }
    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

// Reduce una ruta a máximo `maxPoints` puntos (conserva el primero y el último) para guardarla
// en Firestore y dibujarla luego con Polyline sin pedir de nuevo la ruta.
export function simplifyPath(points, maxPoints = 150) {
  if (points.length <= maxPoints) {
    return points;
  }
  const step = (points.length - 1) / (maxPoints - 1);
  return Array.from({ length: maxPoints }, (_, i) => points[Math.round(i * step)]);
}
