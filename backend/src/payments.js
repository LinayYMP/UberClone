// AI-assisted: see docs/AI_LOG.md #11
// Mercado Pago Checkout Pro en modo de prueba (sección 4 del documento). El access_token solo existe
// en backend/.env. El backend crea la preferencia y, cuando la pasarela responde (URL de retorno o
// webhook), consulta el pago y actualiza el viaje: paymentStatus, paymentId y status "paid".
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

import { config } from './config.js';
import { FieldValue, tripsCollection } from './firebaseAdmin.js';

const client = config.mercadoPagoAccessToken ? new MercadoPagoConfig({ accessToken: config.mercadoPagoAccessToken }) : null;

export const isMercadoPagoConfigured = Boolean(client);

export class PaymentError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Monto que debe pagar el pasajero: tarifa final + propina, calculadas por la app al finalizar.
const amountToCharge = (trip) => trip.fare + (trip.tip ?? 0);

// La app solo puede pedir que el checkout vuelva a sí misma (exp:// en Expo Go, uberclone:// o la web local).
const isAllowedReturnUrl = (url) => /^(exp|exps|uberclone):\/\//.test(url) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(url);

export async function createCheckout({ driverId, tripId, amount, returnUrl }) {
  if (!client) {
    throw new PaymentError(503, 'Falta MERCADOPAGO_ACCESS_TOKEN en backend/.env');
  }
  const tripRef = tripsCollection.doc(tripId);
  const trip = (await tripRef.get()).data();
  if (!trip || trip.driverId !== driverId) {
    throw new PaymentError(404, 'Viaje no encontrado');
  }
  if (trip.status !== 'completed' || trip.paymentMethod !== 'mercadopago') {
    throw new PaymentError(409, 'El viaje no está pendiente de cobro con Mercado Pago');
  }
  // El monto lo calcula la app, pero se compara con el guardado para que nadie cobre otra cifra.
  if (Number(amount) !== amountToCharge(trip)) {
    throw new PaymentError(400, 'El monto no coincide con la tarifa del viaje');
  }

  const appUrl = isAllowedReturnUrl(returnUrl ?? '') ? returnUrl : '';
  const backUrl = `${config.publicUrl}/payments/mercadopago/return?app=${encodeURIComponent(appUrl)}`;
  const isPublicHttps = config.publicUrl.startsWith('https://');

  const preference = await new Preference(client).create({
    body: {
      items: [{ id: tripId, title: 'Viaje UberClone', quantity: 1, unit_price: amountToCharge(trip), currency_id: 'COP' }],
      external_reference: tripId,
      back_urls: { success: backUrl, failure: backUrl, pending: backUrl },
      // Mercado Pago solo acepta regreso automático y webhook con una URL pública HTTPS (ngrok, por ejemplo).
      ...(isPublicHttps ? { auto_return: 'approved', notification_url: `${config.publicUrl}/payments/mercadopago/webhook` } : {}),
    },
  });

  await tripRef.update({ paymentPreferenceId: preference.id, paymentStatus: 'pending' });
  return { checkoutUrl: preference.init_point };
}

const toPaymentStatus = (status) => {
  if (status === 'approved') {
    return 'approved';
  }
  if (status === 'rejected' || status === 'cancelled') {
    return 'rejected';
  }
  return 'pending';
};

// Consulta el pago en Mercado Pago (no se confía en los parámetros de la URL) y actualiza el viaje.
export async function syncPayment(paymentId) {
  if (!client || !paymentId) {
    return null;
  }
  const payment = await new Payment(client).get({ id: paymentId });
  const tripId = payment.external_reference;
  const tripRef = tripsCollection.doc(tripId);
  const trip = (await tripRef.get()).data();
  if (!trip || trip.status === 'paid') {
    return trip ?? null;
  }
  const paymentStatus = toPaymentStatus(payment.status);
  const amountMatches = Number(payment.transaction_amount) === amountToCharge(trip);
  const approved = paymentStatus === 'approved' && amountMatches;

  await tripRef.update({
    paymentId: String(payment.id),
    paymentStatus: approved ? 'approved' : paymentStatus === 'approved' ? 'rejected' : paymentStatus,
    ...(approved ? { status: 'paid', paidAt: FieldValue.serverTimestamp() } : {}),
  });
  console.log(`[pagos] ${tripId}: pago ${payment.id} ${payment.status}`);
  return { tripId, paymentStatus };
}
