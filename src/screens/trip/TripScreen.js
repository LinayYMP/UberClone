// AI-assisted: see docs/AI_LOG.md #11
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppButton from '../../components/AppButton.js';
import ConfirmSheet from '../../components/ConfirmSheet.js';
import InlineMessage from '../../components/InlineMessage.js';
import DriverMap from '../../components/map/DriverMap';
import { COLORS, MAX_CONTENT_WIDTH, RADIUS, SHADOW, SPACING, TYPOGRAPHY } from '../../constants/theme.js';
import { TRIP_STATUS } from '../../constants/trips.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useRegistration } from '../../context/RegistrationContext.js';
import { useTrip } from '../../context/TripContext.js';
import useDriverLocation from '../../hooks/useDriverLocation.js';

// Si no llega la ubicación, se sigue sin dibujar la ruta para no dejar al pasajero esperando.
const LOCATION_WAIT_MS = 8000;

// Viaje en curso: primero la ruta hacia el punto de recogida; al tocar "Pasajero a bordo" la ruta
// cambia hacia el destino. Durante el viaje la ubicación del conductor se sigue enviando a Firestore.
export default function TripScreen() {
  const { t } = usePreferences();
  const { driverId } = useRegistration();
  const { activeTrip: trip, goToPickup, markPassengerOnBoard, finishTrip, cancelTrip } = useTrip();
  const insets = useSafeAreaInsets();
  const { location } = useDriverLocation({ watch: true, publishFor: driverId });

  const [isBusy, setIsBusy] = useState(false);
  const [errorKey, setErrorKey] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const pickupStarted = useRef(false);

  // Recién aceptado: una sola consulta de ruta hacia la recogida y paso a "driver_arriving".
  useEffect(() => {
    if (trip.status !== TRIP_STATUS.ACCEPTED || pickupStarted.current || !location) {
      return;
    }
    pickupStarted.current = true;
    goToPickup(trip, location).catch(() => {
      pickupStarted.current = false;
      setErrorKey('trip.actionError');
    });
  }, [trip, location, goToPickup]);

  // Respaldo si la ubicación no llega a tiempo. La limpieza cancela el temporizador.
  useEffect(() => {
    if (trip.status !== TRIP_STATUS.ACCEPTED) {
      return undefined;
    }
    const timer = setTimeout(() => {
      if (!pickupStarted.current) {
        pickupStarted.current = true;
        goToPickup(trip, null).catch(() => setErrorKey('trip.actionError'));
      }
    }, LOCATION_WAIT_MS);
    return () => clearTimeout(timer);
  }, [trip, goToPickup]);

  const isInProgress = trip.status === TRIP_STATUS.IN_PROGRESS;
  const isPreparing = trip.status === TRIP_STATUS.ACCEPTED;
  const route = isInProgress ? trip.route : trip.pickupRoute;
  const markers = isInProgress
    ? [{ id: 'destination', point: trip.destination, kind: 'destination' }]
    : [{ id: 'pickup', point: trip.origin, kind: 'pickup' }];
  const legDistance = isInProgress ? trip.distanceKm : trip.pickupDistanceKm;
  const legDuration = isInProgress ? trip.durationMin : trip.pickupDurationMin;

  const run = async (action) => {
    setIsBusy(true);
    setErrorKey(null);
    try {
      await action(trip);
    } catch {
      setErrorKey('trip.actionError');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <DriverMap driverLocation={location} markers={markers} route={route} />

      <View style={[styles.banner, { marginTop: insets.top + SPACING.sm }]}>
        <Ionicons name={isInProgress ? 'navigate' : 'person'} size={20} color={COLORS.textOnBrand} />
        <Text style={styles.bannerText}>{isInProgress ? t('trip.inProgressTitle') : t('trip.arrivingTitle')}</Text>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + SPACING.lg }]}>
        <View style={styles.card}>
          {isPreparing ? (
            <View style={styles.preparing}>
              <ActivityIndicator color={COLORS.brand} />
              <Text style={styles.hint}>{t('trip.preparing')}</Text>
            </View>
          ) : null}

          <View style={styles.passengerRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color={COLORS.textSecondary} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.label}>{t('trip.passenger')}</Text>
              <Text style={styles.passengerName}>{trip.passengerName ?? '—'}</Text>
            </View>
            <View style={styles.methodChip}>
              <Text style={styles.methodText}>{t(`paymentMethod.${trip.paymentMethod}`)}</Text>
            </View>
          </View>

          <View>
            <Text style={styles.label}>{isInProgress ? t('trip.dropOffAt') : t('trip.pickupAt')}</Text>
            <Text style={styles.address}>{isInProgress ? trip.destination?.address : trip.origin?.address}</Text>
            {legDistance ? (
              <Text style={styles.hint}>
                {t('common.km', { value: legDistance })} · {t('common.minutes', { value: legDuration })}
              </Text>
            ) : null}
          </View>

          {!isPreparing && !route ? <InlineMessage tone="info" message={t('trip.noRoute')} /> : null}
          <InlineMessage tone="danger" message={errorKey ? t(errorKey) : null} />

          {trip.status === TRIP_STATUS.DRIVER_ARRIVING ? (
            <>
              <AppButton title={t('trip.onBoard')} icon="person-add-outline" loading={isBusy} onPress={() => run(markPassengerOnBoard)} />
              <AppButton title={t('trip.cancel')} variant="secondary" disabled={isBusy} onPress={() => setConfirmAction('cancel')} />
            </>
          ) : null}
          {isInProgress ? (
            <AppButton title={t('trip.finish')} icon="flag-outline" onPress={() => setConfirmAction('finish')} />
          ) : null}
        </View>
      </View>

      <ConfirmSheet
        visible={confirmAction === 'finish'}
        onClose={() => setConfirmAction(null)}
        title={t('trip.finishTitle')}
        message={t('trip.finishMessage')}
        confirmLabel={t('trip.finish')}
        cancelLabel={t('common.back')}
        errorMessage={t('trip.actionError')}
        onConfirm={() => finishTrip(trip)}
      />
      <ConfirmSheet
        visible={confirmAction === 'cancel'}
        onClose={() => setConfirmAction(null)}
        title={t('trip.cancelTitle')}
        message={t('trip.cancelMessage')}
        confirmLabel={t('trip.cancel')}
        cancelLabel={t('trip.keepTrip')}
        variant="danger"
        errorMessage={t('trip.actionError')}
        onConfirm={() => cancelTrip(trip)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.surfaceMuted,
  },
  flex: {
    flex: 1,
  },
  banner: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    height: 44,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.brand,
    ...SHADOW,
  },
  bannerText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textOnBrand,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SPACING.lg,
  },
  card: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOW,
  },
  preparing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceMuted,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  passengerName: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textPrimary,
  },
  methodChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceMuted,
  },
  methodText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  address: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.xxs,
  },
  hint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: SPACING.xxs,
  },
});
