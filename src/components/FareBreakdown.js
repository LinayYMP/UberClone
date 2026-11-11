// AI-assisted: see docs/AI_LOG.md #11
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { formatCOP } from '../utils/earnings.js';

// Tarifa, propina, comisión (con el porcentaje guardado en el viaje) y ganancia neta.
export default function FareBreakdown({ trip }) {
  const { t } = usePreferences();
  const percent = Math.round((trip.commissionRate ?? 0) * 100);

  return (
    <View style={styles.container}>
      <Row label={t('charge.fare')} value={formatCOP(trip.fare ?? 0)} />
      <Row label={t('charge.tip')} value={formatCOP(trip.tip ?? 0)} />
      <Row label={t('charge.commission', { percent })} value={`- ${formatCOP(trip.commission ?? 0)}`} muted />
      <View style={styles.divider} />
      <Row label={t('charge.earnings')} value={formatCOP(trip.driverEarnings ?? 0)} strong />
    </View>
  );
}

function Row({ label, value, muted = false, strong = false }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, muted && styles.muted, strong && styles.strongLabel]}>{label}</Text>
      <Text style={[styles.value, muted && styles.muted, strong && styles.strongValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.body,
    flex: 1,
    color: COLORS.textPrimary,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  muted: {
    color: COLORS.textSecondary,
  },
  strongLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  strongValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
});
