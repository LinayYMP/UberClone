// AI-assisted: see docs/AI_LOG.md #11
// Simula que el pasajero cancela su viaje más reciente (solo antes de que suba: in_progress).
// Uso: npm run simular:cancelar
import { db, FieldValue, tripsCollection } from '../src/firebaseAdmin.js';

const CANCELLABLE = ['requested', 'accepted', 'driver_arriving'];

async function main() {
  const snapshot = await tripsCollection.where('status', 'in', CANCELLABLE).get();
  const latest = snapshot.docs.sort((a, b) => (b.data().createdAt?.toMillis() ?? 0) - (a.data().createdAt?.toMillis() ?? 0))[0];
  if (!latest) {
    console.log('No hay viajes que se puedan cancelar.');
  } else {
    await latest.ref.update({
      status: 'cancelled',
      cancelledBy: 'passenger',
      cancelledAt: FieldValue.serverTimestamp(),
      offeredTo: null,
    });
    console.log(`Viaje ${latest.id} cancelado por el pasajero.`);
  }
  await db.terminate();
}

main().catch((error) => {
  console.error('No se pudo cancelar:', error.message);
  process.exit(1);
});
