// AI-assisted: see docs/AI_LOG.md #11
// Avisos de solicitudes nuevas. Con la app en segundo plano los envía el backend por Firebase Cloud
// Messaging al token FCM del conductor; eso requiere una build de desarrollo (Expo Go no recibe push
// en Android desde SDK 53). En Expo Go se usa una notificación local cuando llega la solicitud.
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';

const CHANNEL_ID = 'trip-requests';
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Solicitudes de viaje',
      importance: Notifications.AndroidImportance.MAX,
    });
  }
}

// Pide permiso y devuelve el token FCM del dispositivo, o null si no se puede (Expo Go, emulador
// sin servicios de Google o permiso negado).
export async function registerForPushNotifications() {
  if (isExpoGo || !Device.isDevice) {
    return null;
  }
  try {
    await ensureChannel();
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }
    const token = await Notifications.getDevicePushTokenAsync();
    return token.data;
  } catch {
    return null;
  }
}

// Notificación local si la solicitud llega mientras la app no está en primer plano.
export async function notifyIncomingRequest(title, body) {
  if (AppState.currentState === 'active') {
    return;
  }
  try {
    await ensureChannel();
    await Notifications.scheduleNotificationAsync({ content: { title, body }, trigger: null });
  } catch {
    // sin permiso de notificaciones: la tarjeta de la solicitud se ve al volver a la app
  }
}
