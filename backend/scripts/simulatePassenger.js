// AI-assisted: see docs/AI_LOG.md #11
// Simulador de pasajero: crea una solicitud de viaje en Firestore cerca de un conductor disponible,
// con el mismo modelo de datos de la sección 6. El despachador (npm start) se la ofrece al conductor.
//
// Uso: npm run simular:viaje -- [--metodo efectivo|mercadopago] [--categoria economy|xl|premium]
//                               [--propina 2000] [--conductor correo@ejemplo.com]
import { getRoute } from '../../src/services/routingService.js';
import { calculateFare } from '../../src/utils/calculateFare.js';
import { db, driversCollection, FieldValue, tripsCollection } from '../src/firebaseAdmin.js';

const PASSENGERS = ['Ana Restrepo', 'Carlos Gómez', 'Valentina Ríos', 'Julián Mejía', 'Sofía Herrera', 'Mateo Álvarez'];
const METHODS = { efectivo: 'cash', cash: 'cash', mercadopago: 'mercadopago' };
const MEDELLIN = { lat: 6.2442, lng: -75.5812 };

function readArgs() {
  const args = process.argv.slice(2);
  const value = (name) => {
    const index = args.indexOf(`--${name}`);
    return index >= 0 ? args[index + 1] : undefined;
  };
  return {
    paymentMethod: METHODS[value('metodo')] ?? (Math.random() < 0.5 ? 'cash' : 'mercadopago'),
    category: value('categoria') ?? 'economy',
    tip: Number(value('propina') ?? 0),
    driverEmail: value('conductor'),
  };
}

const randomBetween = (min, max) => min + Math.random() * (max - min);

// Punto a una distancia aproximada (en km) en una dirección al azar.
function offset(point, km) {
  const angle = Math.random() * 2 * Math.PI;
  return {
    lat: point.lat + (km / 111) * Math.cos(angle),
    lng: point.lng + (km / (111 * Math.cos((point.lat * Math.PI) / 180))) * Math.sin(angle),
  };
}

// Nominatim (OpenStreetMap): convierte coordenadas en dirección. Máximo 1 petición por segundo.
async function reverseGeocode(point) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${point.lat}&lon=${point.lng}&zoom=17`;
    const response = await fetch(url, { headers: { 'User-Agent': 'UberClone-Conductor-proyecto-academico/1.0' } });
    const data = await response.json();
    const { road, house_number: number, neighbourhood, suburb, city, town } = data.address ?? {};
    return [road && number ? `${road} #${number}` : road, neighbourhood ?? suburb, city ?? town].filter(Boolean).join(', ') || data.display_name;
  } catch {
    return `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
  } finally {
    await new Promise((resolve) => setTimeout(resolve, 1100));
  }
}

async function findCenter(driverEmail) {
  let query = driversCollection.where('isAvailable', '==', true);
  if (driverEmail) {
    query = driversCollection.where('email', '==', driverEmail.toLowerCase());
  }
  const snapshot = await query.limit(1).get();
  const driver = snapshot.docs[0]?.data();
  if (!driver?.location) {
    console.log('No hay conductores disponibles con ubicación; la solicitud se crea en Medellín.');
    return MEDELLIN;
  }
  console.log(`Solicitud cerca de ${driver.email}`);
  return driver.location;
}

async function main() {
  const { paymentMethod, category, tip, driverEmail } = readArgs();
  const center = await findCenter(driverEmail);
  const originPoint = offset(center, randomBetween(0.4, 1.2));
  const destinationPoint = offset(originPoint, randomBetween(3, 7));

  // Distancia y duración se calculan una sola vez, al crear la solicitud.
  const route = await getRoute(originPoint, destinationPoint);
  const origin = { ...originPoint, address: await reverseGeocode(originPoint) };
  const destination = { ...destinationPoint, address: await reverseGeocode(destinationPoint) };
  // Misma función de tarifa que usa la app al cerrar el viaje.
  const estimate = calculateFare({ distanceKm: route.distanceKm, durationMin: route.durationMin, category, tip });

  const tripRef = tripsCollection.doc();
  await tripRef.set({
    passengerId: `pas_${Math.random().toString(36).slice(2, 10)}`,
    passengerName: PASSENGERS[Math.floor(Math.random() * PASSENGERS.length)],
    driverId: null,
    offeredTo: null,
    rejectedDriverIds: [],
    origin,
    destination,
    distanceKm: route.distanceKm,
    durationMin: route.durationMin,
    route: route.path,
    category,
    paymentMethod,
    paymentStatus: null,
    paymentId: null,
    tip: estimate.tip,
    estimatedFare: estimate.fare,
    estimatedDriverEarnings: estimate.driverEarnings,
    commissionRate: estimate.commissionRate,
    rating: null,
    status: 'requested',
    createdAt: FieldValue.serverTimestamp(),
  });

  console.log(`Solicitud ${tripRef.id} creada`);
  console.log(`  ${origin.address} -> ${destination.address}`);
  console.log(`  ${route.distanceKm} km, ${route.durationMin} min, ${category}, ${paymentMethod}, tarifa estimada ${estimate.fare} COP`);
  await db.terminate();
}

main().catch((error) => {
  console.error('No se pudo crear la solicitud:', error.message);
  process.exit(1);
});
