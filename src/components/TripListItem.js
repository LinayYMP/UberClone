// AI-assisted: see docs/AI_LOG.md #11
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING } from '../constants/theme.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { formatCOP } from '../utils/earnings.js';
import { formatDateTime } from '../utils/dates.js';
import StatusBadge from './StatusBadge.js';
import TripRoute from './TripRoute.js';

// Fila del historial: fecha y hora, origen -> destino, categoría, tarifa, ganancia neta y estado del pago.
export default function TripListItem({ trip, onPress }) {
  const { t, language } = usePreferences();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <Text style={styles.date}>{formatDateTime(trip.createdAt, language)}</Text>
        <StatusBadge paymentStatus={trip.paymentStatus} tripStatus={trip.status} />
      </View>
      <TripRoute origin={trip.origin?.address} destination={trip.destination?.address} compact />
      <View style={styles.footer}>
        <Text style={styles.category}>{t(`options.category.${trip.category}`)}</Text>
        <View style={styles.amounts}>
          <Text style={styles.fare}>{formatCOP(trip.fare ?? trip.estimatedFare ?? 0)}</Text>
          <Text style={styles.earnings}>{formatCOP(trip.driverEarnings ?? 0)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  pressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  date: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  category: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  amounts: {
    alignItems: 'flex-end',
  },
  fare: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  earnings: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
});
