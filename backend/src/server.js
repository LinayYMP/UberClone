// AI-assisted: see docs/AI_LOG.md #11
// Backend de UberClone Conductor (Node.js + Express): cobros con Mercado Pago y despacho de solicitudes.
import cors from 'cors';
import express from 'express';

import { config, usingEmulator } from './config.js';
import { startDispatcher } from './dispatcher.js';
import { adminAuth } from './firebaseAdmin.js';
import { createCheckout, isMercadoPagoConfigured, PaymentError, syncPayment } from './payments.js';

const app = express();
app.use(cors());
app.use(express.json());

// Solo un conductor con sesión (token de Firebase Authentication) puede crear un cobro.
async function requireDriver(req, res, next) {
  const token = (req.headers.authorization ?? '').replace(/^Bearer /, '');
  try {
    req.driverId = (await adminAuth.verifyIdToken(token)).uid;
    next();
  } catch {
    res.status(401).json({ error: 'Sesión inválida' });
  }
}

app.get('/health', (req, res) => {
  res.json({ ok: true, emulator: usingEmulator, mercadoPago: isMercadoPagoConfigured });
});

// La app envía tripId y monto; el backend crea la preferencia con la llave secreta.
app.post('/payments/mercadopago/preference', requireDriver, async (req, res) => {
  try {
    const { tripId, amount, returnUrl } = req.body ?? {};
    res.json(await createCheckout({ driverId: req.driverId, tripId, amount, returnUrl }));
  } catch (error) {
    const status = error instanceof PaymentError ? error.status : 500;
    console.error('[pagos]', error.message);
    res.status(status).json({ error: error.message });
  }
});

// URL de retorno del checkout: se verifica el pago y se vuelve a la app.
app.get('/payments/mercadopago/return', async (req, res) => {
  const paymentId = req.query.payment_id ?? req.query.collection_id;
  try {
    await syncPayment(paymentId);
  } catch (error) {
    console.error('[pagos] retorno:', error.message);
  }
  const appUrl = typeof req.query.app === 'string' ? req.query.app : '';
  if (appUrl) {
    res.redirect(appUrl);
    return;
  }
  res.send('<p style="font-family:sans-serif">Pago procesado. Ya puedes volver a la app UberClone Conductor.</p>');
});

// Webhook de Mercado Pago (necesita URL pública HTTPS).
app.post('/payments/mercadopago/webhook', async (req, res) => {
  const paymentId = req.body?.data?.id ?? req.query['data.id'] ?? req.query.id;
  const topic = req.body?.type ?? req.query.type ?? req.query.topic;
  res.sendStatus(200);
  if (topic === 'payment' && paymentId) {
    syncPayment(paymentId).catch((error) => console.error('[pagos] webhook:', error.message));
  }
});

app.listen(config.port, () => {
  console.log(`[backend] http://localhost:${config.port} (${usingEmulator ? 'emulador de Firebase' : config.firebaseProjectId})`);
  if (!isMercadoPagoConfigured) {
    console.log('[backend] Mercado Pago sin configurar: agrega MERCADOPAGO_ACCESS_TOKEN en backend/.env');
  }
  startDispatcher();
});
