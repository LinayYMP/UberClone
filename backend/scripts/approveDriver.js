// AI-assisted: see docs/AI_LOG.md #11
// Simula la aprobación de la cuenta: cambia accountStatus a "approved" en la base de datos
// (el documento permite simularla así). También se puede hacer desde la consola de Firebase.
// Uso: npm run aprobar -- correo@ejemplo.com
import { db, driversCollection } from '../src/firebaseAdmin.js';

async function main() {
  const email = process.argv[2]?.toLowerCase();
  if (!email) {
    console.log('Uso: npm run aprobar -- correo@ejemplo.com');
    process.exit(1);
  }
  const snapshot = await driversCollection.where('email', '==', email).limit(1).get();
  const driver = snapshot.docs[0];
  if (!driver) {
    console.log(`No existe un conductor con el correo ${email}.`);
  } else if (driver.data().accountStatus !== 'pending_approval') {
    console.log(`La cuenta está en "${driver.data().accountStatus}": solo se aprueban registros enviados.`);
  } else {
    await driver.ref.update({ accountStatus: 'approved' });
    console.log(`Cuenta de ${email} aprobada.`);
  }
  await db.terminate();
}

main().catch((error) => {
  console.error('No se pudo aprobar:', error.message);
  process.exit(1);
});
