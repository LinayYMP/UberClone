// AI-assisted: see docs/AI_LOG.md #11
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { COLORS, RADIUS, SPACING } from '../constants/theme.js';

// Fila de filtros de una sola selección (periodos del historial y de ganancias, método de pago).
// options: [{ value, label }]
export default function FilterChips({ options, value, onChange, accessibilityLabel }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: isSelected }}
            style={({ pressed }) => [styles.chip, isSelected && styles.chipSelected, pressed && !isSelected && styles.pressed]}
          >
            <Text style={[styles.text, isSelected && styles.textSelected]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: SPACING.sm,
  },
  chip: {
    minHeight: 38,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: COLORS.brand,
    borderColor: COLORS.brand,
  },
  pressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  textSelected: {
    color: COLORS.textOnBrand,
  },
});
