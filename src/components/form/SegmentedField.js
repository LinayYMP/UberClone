// AI-assisted: see docs/AI_LOG.md #1
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING, TOUCH_TARGET } from '../../constants/theme.js';
import FormField from './FormField.js';

// Selector de pocas opciones visibles a la vez (idioma español / inglés).
// options: [{ value, label }]
export default function SegmentedField({ label, value, options, onChange, error, hint }) {
  return (
    <FormField label={label} error={error} hint={hint}>
      <View style={styles.track} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ checked: isSelected }}
              style={[styles.segment, isSelected && styles.segmentSelected]}
            >
              <Text style={[styles.text, isSelected && styles.textSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </FormField>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: SPACING.xs,
    gap: SPACING.xs,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceMuted,
  },
  segment: {
    flex: 1,
    minHeight: TOUCH_TARGET - 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.sm,
  },
  segmentSelected: {
    backgroundColor: COLORS.brand,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  textSelected: {
    color: COLORS.textOnBrand,
  },
});
