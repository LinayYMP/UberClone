// AI-assisted: see docs/AI_LOG.md #11
// Cobro con Mercado Pago Checkout Pro (modo de prueba). El access_token nunca está en la app: el
// backend (carpeta backend/) crea la preferencia y, cuando la pasarela responde, actualiza el viaje.
// La app solo abre el checkout y escucha el cambio del viaje en tiempo real.
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { getIdToken } from './authService';
import { ERROR_CODES, ServiceError, toServiceError } from './serviceError.js';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const isPaymentBackendConfigured = Boolean(BACKEND_URL);

async function postToBackend(path, body) {
  if (!isPaymentBackendConfigured) {
    throw new ServiceError(ERROR_CODES.BACKEND_NOT_CONFIGURED);
  }
  const token = await getIdToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new ServiceError(ERROR_CODES.PAYMENT_FAILED);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

// Envía al backend el tripId y el monto, y abre el checkout para que el pasajero pague con una
// tarjeta de prueba. Al terminar, Mercado Pago vuelve al backend y este redirige a la app.
export async function startMercadoPagoCheckout(trip) {
  try {
    const returnUrl = Linking.createURL('pago');
    const { checkoutUrl } = await postToBackend('/payments/mercadopago/preference', {
      tripId: trip.id,
      amount: trip.fare + (trip.tip ?? 0),
      returnUrl,
    });
    await WebBrowser.openAuthSessionAsync(checkoutUrl, returnUrl);
  } catch (error) {
    throw toServiceError(error);
  }
}
