// AI-assisted: see docs/AI_LOG.md #11
import { StyleSheet, Text, View } from 'react-native';

import { PAYMENT_STATUS, TRIP_STATUS } from '../constants/trips.js';
import { COLORS, RADIUS, SPACING } from '../constants/theme.js';
import { usePreferences } from '../context/PreferencesContext.js';

const TONES = {
  success: { background: COLORS.successSoft, color: COLORS.success },
  warning: { background: COLORS.warningSoft, color: COLORS.warning },
  danger: { background: COLORS.dangerSoft, color: COLORS.danger },
  neutral: { background: COLORS.surfaceMuted, color: COLORS.textSecondary },
};

const PAYMENT_TONES = {
  [PAYMENT_STATUS.APPROVED]: 'success',
  [PAYMENT_STATUS.CASH]: 'success',
  [PAYMENT_STATUS.PENDING]: 'warning',
  [PAYMENT_STATUS.REJECTED]: 'danger',
};

// Estado del pago (Aprobado, Pendiente, Rechazado o Efectivo) o, si no hay pago, estado del viaje.
export default function StatusBadge({ paymentStatus, tripStatus, style }) {
  const { t } = usePreferences();
  let label;
  let tone;
  if (tripStatus === TRIP_STATUS.CANCELLED || tripStatus === TRIP_STATUS.REJECTED || !paymentStatus) {
    label = t(`tripStatus.${tripStatus}`);
    tone = tripStatus === TRIP_STATUS.CANCELLED ? 'danger' : 'neutral';
  } else {
    label = t(`paymentStatus.${paymentStatus}`);
    tone = PAYMENT_TONES[paymentStatus] ?? 'neutral';
  }
  const palette = TONES[tone];

  return (
    <View style={[styles.badge, { backgroundColor: palette.background }, style]}>
      <View style={[styles.dot, { backgroundColor: palette.color }]} />
      <Text style={[styles.text, { color: palette.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
