// AI-assisted: see docs/AI_LOG.md #11
// Despachador: ofrece cada solicitud nueva al conductor disponible y aprobado más cercano.
// Si el conductor la rechaza o vence su tiempo, se ofrece al siguiente; si no queda ninguno,
// la solicitud queda en "rejected" (sección 3 del documento).
import { haversineKm } from '../../src/utils/geo.js';
import { config, usingEmulator } from './config.js';
import { db, driversCollection, FieldValue, messaging, tripsCollection } from './firebaseAdmin.js';

const toMillis = (value) => (value && typeof value.toMillis === 'function' ? value.toMillis() : 0);

async function findNearestDriver(trip, excludedIds) {
  const snapshot = await driversCollection.where('isAvailable', '==', true).where('accountStatus', '==', 'approved').get();
  const now = Date.now();
  return snapshot.docs
    .map((document) => ({ id: document.id, ...document.data() }))
    .filter((driver) => driver.location && !excludedIds.includes(driver.id))
    .filter((driver) => now - toMillis(driver.locationUpdatedAt) < config.staleLocationMs)
    .map((driver) => ({ ...driver, distanceKm: haversineKm(driver.location, trip.origin) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)[0];
}

// Aviso por Firebase Cloud Messaging para la app en segundo plano (solo con el proyecto real).
async function notifyDriver(driver, trip) {
  if (usingEmulator || !driver.fcmToken) {
    return;
  }
  try {
    await messaging.send({
      token: driver.fcmToken,
      notification: { title: 'Nueva solicitud de viaje', body: `${trip.origin.address} → ${trip.destination.address}` },
      android: { priority: 'high', notification: { channelId: 'trip-requests' } },
    });
  } catch (error) {
    console.warn('[despacho] No se pudo enviar la notificación FCM:', error.message);
  }
}

async function offerTrip(tripId) {
  const tripRef = tripsCollection.doc(tripId);
  let offered = null;
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(tripRef);
    const trip = snapshot.data();
    if (!trip || trip.status !== 'requested' || trip.offeredTo) {
      return;
    }
    const driver = await findNearestDriver(trip, trip.rejectedDriverIds ?? []);
    if (!driver) {
      transaction.update(tripRef, { status: 'rejected', rejectedAt: FieldValue.serverTimestamp() });
      console.log(`[despacho] ${tripId}: sin conductores disponibles -> rejected`);
      return;
    }
    transaction.update(tripRef, { offeredTo: driver.id, offeredAt: FieldValue.serverTimestamp() });
    offered = { driver, trip };
  });
  if (offered) {
    console.log(`[despacho] ${tripId}: ofrecida a ${offered.driver.email} (${offered.driver.distanceKm.toFixed(1)} km)`);
    await notifyDriver(offered.driver, offered.trip);
  }
}

// Ofertas sin respuesta (por ejemplo, la app se cerró): cuentan como rechazo por tiempo.
async function expireOffers() {
  const snapshot = await tripsCollection.where('status', '==', 'requested').get();
  const now = Date.now();
  for (const document of snapshot.docs) {
    const trip = document.data();
    if (trip.offeredTo && now - toMillis(trip.offeredAt) > config.offerTimeoutMs) {
      await document.ref.update({
        offeredTo: null,
        rejectedDriverIds: FieldValue.arrayUnion(trip.offeredTo),
        lastRejection: { driverId: trip.offeredTo, reason: 'timeout' },
      });
    }
  }
}

export function startDispatcher() {
  const unsubscribe = tripsCollection.where('status', '==', 'requested').onSnapshot(
    (snapshot) => {
      for (const document of snapshot.docs) {
        if (!document.data().offeredTo) {
          offerTrip(document.id).catch((error) => console.error('[despacho]', error.message));
        }
      }
    },
    (error) => console.error('[despacho] Error escuchando solicitudes:', error.message),
  );
  const timer = setInterval(() => expireOffers().catch((error) => console.error('[despacho]', error.message)), 5000);
  console.log('[despacho] Escuchando solicitudes nuevas');
  return () => {
    unsubscribe();
    clearInterval(timer);
  };
}
