// AI-assisted: see docs/AI_LOG.md #11
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { REQUEST_TIMEOUT_SECONDS } from '../constants/trips.js';
import { COLORS, RADIUS, SHADOW, SPACING, TYPOGRAPHY } from '../constants/theme.js';
import { usePreferences } from '../context/PreferencesContext.js';
import useCountdown from '../hooks/useCountdown.js';
import { formatCOP } from '../utils/earnings.js';
import AppButton from './AppButton.js';
import InlineMessage from './InlineMessage.js';
import TripRoute from './TripRoute.js';

// Tarjeta de la solicitud entrante: origen, destino, distancia, duración, categoría, método de pago,
// tarifa y ganancia neta estimadas, con 15 segundos para responder. Al llegar a cero se rechaza sola.
export default function IncomingRequestCard({ request, onAccept, onReject, onExpire, busyAction, errorMessage }) {
  const { t } = usePreferences();
  const remaining = useCountdown(REQUEST_TIMEOUT_SECONDS, {
    active: !busyAction,
    resetKey: request.id,
    onExpire,
  });
  const progress = remaining / REQUEST_TIMEOUT_SECONDS;

  return (
    <View style={styles.card} accessibilityViewIsModal accessibilityLiveRegion="assertive">
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {t('request.title')}
        </Text>
        <View style={[styles.timer, remaining <= 5 && styles.timerUrgent]}>
          <Ionicons name="time-outline" size={16} color={COLORS.textOnBrand} />
          <Text style={styles.timerText}>{t('request.seconds', { seconds: remaining })}</Text>
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.bar, { width: `${progress * 100}%` }, remaining <= 5 && styles.barUrgent]} />
      </View>

      <View style={styles.earnings}>
        <Text style={styles.earningsLabel}>{t('request.estimatedEarnings')}</Text>
        <Text style={styles.earningsValue}>{formatCOP(request.estimatedDriverEarnings ?? 0)}</Text>
        <Text style={styles.fare}>
          {t('request.estimatedFare')}: {formatCOP(request.estimatedFare ?? 0)}
        </Text>
      </View>

      <TripRoute
        originLabel={t('request.pickup')}
        origin={request.origin?.address}
        destinationLabel={t('request.destination')}
        destination={request.destination?.address}
      />

      <View style={styles.facts}>
        <Fact icon="navigate-outline" label={t('request.distance')} value={t('common.km', { value: request.distanceKm })} />
        <Fact icon="time-outline" label={t('request.duration')} value={t('common.minutes', { value: request.durationMin })} />
        <Fact icon="pricetag-outline" label={t('request.category')} value={t(`options.category.${request.category}`)} />
        <Fact icon="card-outline" label={t('request.payment')} value={t(`paymentMethod.${request.paymentMethod}`)} />
      </View>

      <InlineMessage tone="danger" message={errorMessage} />

      <View style={styles.actions}>
        <AppButton
          title={t('request.reject')}
          variant="secondary"
          loading={busyAction === 'reject'}
          disabled={Boolean(busyAction)}
          onPress={onReject}
          style={styles.action}
        />
        <AppButton
          title={t('request.accept')}
          icon="checkmark"
          loading={busyAction === 'accept'}
          disabled={Boolean(busyAction)}
          onPress={onAccept}
          style={styles.action}
        />
      </View>
    </View>
  );
}

function Fact({ icon, label, value }) {
  return (
    <View style={styles.fact}>
      <Ionicons name={icon} size={16} color={COLORS.textSecondary} />
      <View>
        <Text style={styles.factLabel}>{label}</Text>
        <Text style={styles.factValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOW,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.brand,
  },
  timerUrgent: {
    backgroundColor: COLORS.danger,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textOnBrand,
  },
  track: {
    height: 4,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceMuted,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: COLORS.brand,
  },
  barUrgent: {
    backgroundColor: COLORS.danger,
  },
  earnings: {
    gap: SPACING.xxs,
  },
  earningsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  earningsValue: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: COLORS.textPrimary,
  },
  fare: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  fact: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  factLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  factValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  action: {
    flex: 1,
  },
});
