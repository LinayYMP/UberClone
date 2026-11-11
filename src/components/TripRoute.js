// AI-assisted: see docs/AI_LOG.md #11
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, SPACING } from '../constants/theme.js';

// Origen -> destino con la línea vertical que los une.
export default function TripRoute({ originLabel, origin, destinationLabel, destination, compact = false }) {
  return (
    <View style={styles.container}>
      <View style={styles.rail}>
        <View style={[styles.dot, styles.originDot]} />
        <View style={styles.line} />
        <View style={[styles.dot, styles.destinationDot]} />
      </View>
      <View style={styles.texts}>
        <View>
          {originLabel ? <Text style={styles.label}>{originLabel}</Text> : null}
          <Text style={styles.address} numberOfLines={compact ? 1 : 2}>
            {origin}
          </Text>
        </View>
        <View>
          {destinationLabel ? <Text style={styles.label}>{destinationLabel}</Text> : null}
          <Text style={styles.address} numberOfLines={compact ? 1 : 2}>
            {destination}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  rail: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  dot: {
    width: 10,
    height: 10,
  },
  originDot: {
    borderRadius: 5,
    backgroundColor: COLORS.success,
  },
  destinationDot: {
    backgroundColor: COLORS.brand,
  },
  line: {
    flex: 1,
    width: 2,
    marginVertical: 3,
    backgroundColor: COLORS.border,
  },
  texts: {
    flex: 1,
    gap: SPACING.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  address: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});
