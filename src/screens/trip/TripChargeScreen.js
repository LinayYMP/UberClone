// AI-assisted: see docs/AI_LOG.md #11
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppButton from '../../components/AppButton.js';
import FareBreakdown from '../../components/FareBreakdown.js';
import InlineMessage from '../../components/InlineMessage.js';
import LoadingView from '../../components/LoadingView.js';
import SectionCard from '../../components/SectionCard.js';
import StarRating from '../../components/StarRating.js';
import StatusBadge from '../../components/StatusBadge.js';
import TripRoute from '../../components/TripRoute.js';
import { COLORS, MAX_CONTENT_WIDTH, SPACING, TYPOGRAPHY } from '../../constants/theme.js';
import { PAYMENT_METHODS, PAYMENT_STATUS, TRIP_STATUS } from '../../constants/trips.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useTrip } from '../../context/TripContext.js';
import { isPaymentBackendConfigured } from '../../services/paymentService';
import { ERROR_CODES } from '../../services/serviceError.js';

// Cobro y resumen del viaje: tarifa final, comisión, ganancia neta y estado del pago (Aprobado,
// Pendiente, Rechazado o Efectivo). Con Mercado Pago el estado lo actualiza el backend y llega en
// tiempo real; en efectivo el conductor confirma que recibió el dinero.
export default function TripChargeScreen() {
  const { t } = usePreferences();
  const { summaryTrip: trip, confirmCashPayment, payWithMercadoPago, ratePassenger, dismissSummary } = useTrip();
  const insets = useSafeAreaInsets();
  const [isBusy, setIsBusy] = useState(false);
  const [errorKey, setErrorKey] = useState(null);

  if (!trip) {
    return <LoadingView message={t('common.loading')} />;
  }

  const isPaid = trip.status === TRIP_STATUS.PAID;
  const isCash = trip.paymentMethod === PAYMENT_METHODS.CASH;

  const run = async (action, failureKey) => {
    setIsBusy(true);
    setErrorKey(null);
    try {
      await action(trip);
    } catch (error) {
      setErrorKey(error.code === ERROR_CODES.BACKEND_NOT_CONFIGURED ? 'charge.backendMissing' : failureKey);
    } finally {
      setIsBusy(false);
    }
  };

  const handleRate = (rating) => {
    ratePassenger(trip.id, rating).catch(() => setErrorKey('trip.actionError'));
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + SPACING.lg, paddingBottom: insets.bottom + SPACING.xl }]}>
        <View style={styles.inner}>
          <Text style={styles.title} accessibilityRole="header">
            {t('charge.title')}
          </Text>

          <SectionCard>
            <TripRoute
              originLabel={t('request.pickup')}
              origin={trip.origin?.address}
              destinationLabel={t('request.destination')}
              destination={trip.destination?.address}
            />
            <Text style={styles.facts}>
              {t('common.km', { value: trip.distanceKm })} · {t('common.minutes', { value: trip.durationMin })} ·{' '}
              {t(`options.category.${trip.category}`)} · {t(`paymentMethod.${trip.paymentMethod}`)}
            </Text>
          </SectionCard>

          <SectionCard>
            <FareBreakdown trip={trip} />
          </SectionCard>

          <SectionCard title={t('charge.paymentStatus')}>
            <StatusBadge paymentStatus={trip.paymentStatus} tripStatus={trip.status} />
            {!isPaid && isCash ? (
              <>
                <Text style={styles.hint}>{t('charge.cashHint')}</Text>
                <AppButton title={t('charge.confirmCash')} icon="cash-outline" loading={isBusy} onPress={() => run(confirmCashPayment, 'trip.actionError')} />
              </>
            ) : null}
            {!isPaid && !isCash ? (
              <>
                <Text style={styles.hint}>{isPaymentBackendConfigured ? t('charge.gatewayHint') : t('charge.backendMissing')}</Text>
                <AppButton
                  title={trip.paymentStatus === PAYMENT_STATUS.REJECTED ? t('charge.retryPayment') : t('charge.payWithMercadoPago')}
                  icon="card-outline"
                  loading={isBusy}
                  disabled={!isPaymentBackendConfigured}
                  onPress={() => run(payWithMercadoPago, 'charge.paymentError')}
                />
              </>
            ) : null}
            <InlineMessage tone="danger" message={errorKey ? t(errorKey) : null} />
          </SectionCard>

          <SectionCard title={t('charge.ratePassenger')}>
            <StarRating value={trip.rating ?? 0} onChange={handleRate} />
          </SectionCard>

          {isPaid ? <AppButton title={t('common.done')} icon="checkmark" onPress={dismissSummary} /> : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: SPACING.lg,
  },
  inner: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    gap: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.display,
    color: COLORS.textPrimary,
  },
  facts: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  hint: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
});
