// AI-assisted: see docs/AI_LOG.md #11
import { DrawerActions, useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppButton from '../../components/AppButton.js';
import IncomingRequestCard from '../../components/IncomingRequestCard.js';
import InlineMessage from '../../components/InlineMessage.js';
import DriverMap from '../../components/map/DriverMap';
import MapButton from '../../components/map/MapButton.js';
import { ACCOUNT_STATUS } from '../../constants/registration.js';
import { COLORS, MAX_CONTENT_WIDTH, RADIUS, SHADOW, SPACING, TYPOGRAPHY } from '../../constants/theme.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useRegistration } from '../../context/RegistrationContext.js';
import { useTrip } from '../../context/TripContext.js';
import useDriverLocation, { LOCATION_PERMISSION } from '../../hooks/useDriverLocation.js';
import useTripRequests from '../../hooks/useTripRequests.js';
import { setAvailability } from '../../services/driverService';
import { notifyIncomingRequest } from '../../services/notificationService';
import { ERROR_CODES } from '../../services/serviceError.js';
import { loadLastAvailability, saveLastAvailability } from '../../services/storage.js';
import { acceptTrip, rejectTrip } from '../../services/tripService';

// Inicio: mapa con la ubicación actual e interruptor Disponible / No disponible. Mientras está
// Disponible (y en esta pantalla) la ubicación se envía a Firestore cada pocos segundos y llegan
// solicitudes; al pasar a No disponible o salir de la pantalla, la limpieza de los useEffect lo detiene.
// (DriverMap se importa sin extensión para que Metro elija DriverMap.web.js en la web.)
export default function HomeScreen({ navigation }) {
  const { t } = usePreferences();
  const { driverId, registration } = useRegistration();
  const { notice, clearNotice } = useTrip();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const isApproved = registration.accountStatus === ACCOUNT_STATUS.APPROVED;

  // useState para la disponibilidad (requisito del documento). El último valor se recuerda en AsyncStorage.
  const [wantsToBeAvailable, setWantsToBeAvailable] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(false);

  useEffect(() => {
    let isActive = true;
    loadLastAvailability().then((lastValue) => {
      if (isActive) {
        setWantsToBeAvailable(lastValue);
      }
    });
    return () => {
      isActive = false;
    };
  }, []);

  // La ubicación se sigue mientras la pantalla está visible (para el mapa) y se publica en Firestore
  // solo si el conductor quiere estar Disponible y su cuenta está aprobada.
  const wantsToPublish = isApproved && wantsToBeAvailable && isFocused;
  const { location, permission, retry } = useDriverLocation({
    watch: isFocused,
    publishFor: wantsToPublish ? driverId : null,
  });
  const hasLocation = permission === LOCATION_PERMISSION.GRANTED;
  const isOnline = wantsToPublish && hasLocation;

  // isAvailable en Firestore refleja si el conductor realmente está en línea; la limpieza lo apaga
  // al pasar a No disponible, al aceptar un viaje o al salir de la pantalla.
  useEffect(() => {
    if (!isOnline) {
      return undefined;
    }
    setAvailability(driverId, true).catch(() => setAvailabilityError(true));
    return () => {
      setAvailability(driverId, false).catch(() => undefined);
    };
  }, [isOnline, driverId]);

  const handleAvailabilityChange = (nextValue) => {
    setWantsToBeAvailable(nextValue);
    setAvailabilityError(false);
    saveLastAvailability(nextValue);
  };

  // useState para la solicitud activa (la trae useTripRequests en tiempo real).
  const request = useTripRequests(driverId, isOnline);
  const [busyAction, setBusyAction] = useState(null);
  const [requestErrorKey, setRequestErrorKey] = useState(null);

  useEffect(() => {
    setRequestErrorKey(null);
    if (request) {
      notifyIncomingRequest(t('request.notificationTitle'), `${request.origin?.address} → ${request.destination?.address}`);
    }
  }, [request?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // useCallback para los manejadores de aceptar y rechazar (requisito del documento).
  const handleAccept = useCallback(async () => {
    setBusyAction('accept');
    try {
      // TripContext detecta el viaje aceptado y TripFlowNavigator muestra "Viaje en curso".
      await acceptTrip(driverId, request.id);
    } catch (error) {
      setRequestErrorKey(error.code === ERROR_CODES.TRIP_UNAVAILABLE ? 'request.unavailable' : 'request.actionError');
      setBusyAction(null);
    }
  }, [driverId, request]);

  const handleReject = useCallback(
    async (reason = 'rejected') => {
      setBusyAction('reject');
      try {
        await rejectTrip(driverId, request.id, reason);
      } catch {
        setRequestErrorKey('request.actionError');
      } finally {
        setBusyAction(null);
      }
    },
    [driverId, request],
  );

  // Temporizador en cero: la solicitud se rechaza automáticamente.
  const handleExpire = useCallback(() => handleReject('timeout'), [handleReject]);

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <DriverMap driverLocation={location} edgePadding={{ top: 120, right: 40, bottom: 360, left: 40 }} />

      <View style={[styles.topBar, { paddingTop: insets.top + SPACING.sm }]} pointerEvents="box-none">
        <MapButton icon="menu" accessibilityLabel={t('home.menu')} onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
        <View style={[styles.statusPill, isOnline && styles.statusPillOnline]}>
          <View style={[styles.statusDot, isOnline && styles.statusDotOnline]} />
          <Text style={[styles.statusText, isOnline && styles.statusTextOnline]}>
            {isOnline ? t('home.online') : t('home.offline')}
          </Text>
        </View>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + SPACING.lg }]} pointerEvents="box-none">
        <View style={styles.bottomContent}>
          {notice ? (
            <View style={styles.notice}>
              <InlineMessage tone="info" message={t(notice)} style={styles.noticeMessage} />
              <AppButton title={t('common.close')} variant="secondary" onPress={clearNotice} style={styles.noticeButton} />
            </View>
          ) : null}

          {request ? (
            <IncomingRequestCard
              request={request}
              busyAction={busyAction}
              errorMessage={requestErrorKey ? t(requestErrorKey) : null}
              onAccept={handleAccept}
              onReject={() => handleReject('rejected')}
              onExpire={handleExpire}
            />
          ) : (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTexts}>
                  <Text style={styles.cardTitle}>{isOnline ? t('home.online') : t('home.offline')}</Text>
                  <Text style={styles.cardHint}>{isOnline ? t('home.onlineHint') : t('home.offlineHint')}</Text>
                </View>
                <Switch
                  value={isApproved && wantsToBeAvailable}
                  onValueChange={handleAvailabilityChange}
                  disabled={!isApproved || !hasLocation}
                  accessibilityLabel={t('home.availabilityLabel')}
                  trackColor={{ false: COLORS.borderStrong, true: COLORS.success }}
                  thumbColor={COLORS.surface}
                />
              </View>
              {!isApproved ? <InlineMessage tone="warning" message={t('home.pendingApproval')} /> : null}
              {permission === LOCATION_PERMISSION.DENIED ? (
                <>
                  <InlineMessage tone="warning" message={t('home.locationDenied')} />
                  <AppButton title={t('home.locationRetry')} variant="secondary" icon="locate-outline" onPress={retry} />
                </>
              ) : null}
              {hasLocation && !location ? <Text style={styles.cardHint}>{t('home.locating')}</Text> : null}
              {availabilityError ? <InlineMessage tone="danger" message={t('home.availabilityError')} /> : null}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.surfaceMuted,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.brand,
    ...SHADOW,
  },
  statusPillOnline: {
    backgroundColor: COLORS.success,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textOnBrandMuted,
  },
  statusDotOnline: {
    backgroundColor: COLORS.textOnBrand,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textOnBrand,
  },
  statusTextOnline: {
    color: COLORS.textOnBrand,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SPACING.lg,
  },
  bottomContent: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    gap: SPACING.md,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.sm,
    ...SHADOW,
  },
  noticeMessage: {
    flex: 1,
  },
  noticeButton: {
    minHeight: 40,
    paddingHorizontal: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOW,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  cardTexts: {
    flex: 1,
    gap: SPACING.xxs,
  },
  cardTitle: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
  },
  cardHint: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
});
