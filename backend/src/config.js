// AI-assisted: see docs/AI_LOG.md #11
// Configuración del backend leída de backend/.env (ver backend/.env.example).
// Las llaves secretas viven solo aquí, nunca en la app.
const port = Number(process.env.PORT ?? 3001);

export const config = {
  port,
  // URL pública del backend (con ngrok, por ejemplo). Mercado Pago vuelve aquí después del pago.
  publicUrl: (process.env.PUBLIC_BACKEND_URL ?? `http://localhost:${port}`).replace(/\/$/, ''),
  mercadoPagoAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? '',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? 'demo-uberclone',
  // 15 s del temporizador en la app más un margen por la red.
  offerTimeoutMs: Number(process.env.OFFER_TIMEOUT_MS ?? 20000),
  // Un conductor que no envía su ubicación hace más de 2 minutos no recibe solicitudes.
  staleLocationMs: 2 * 60 * 1000,
};

export const usingEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
