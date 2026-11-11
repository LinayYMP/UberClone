// AI-assisted: see docs/AI_LOG.md #11
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING } from '../../constants/theme.js';
import FormField from './FormField.js';

// Casilla obligatoria (aceptación de términos) con texto de apoyo y error debajo.
export default function CheckboxField({ label, description, value, onChange, error }) {
  return (
    <FormField error={error}>
      <Pressable
        onPress={() => onChange(!value)}
        accessibilityRole="checkbox"
        accessibilityLabel={label}
        accessibilityState={{ checked: value }}
        style={({ pressed }) => [styles.row, error && styles.rowInvalid, pressed && styles.pressed]}
      >
        <View style={[styles.box, value && styles.boxChecked, error && !value && styles.boxInvalid]}>
          {value ? <Ionicons name="checkmark" size={18} color={COLORS.textOnBrand} /> : null}
        </View>
        <View style={styles.texts}>
          <Text style={styles.label}>{label}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
      </Pressable>
    </FormField>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  rowInvalid: {
    borderColor: COLORS.danger,
  },
  pressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  boxChecked: {
    backgroundColor: COLORS.brand,
    borderColor: COLORS.brand,
  },
  boxInvalid: {
    borderColor: COLORS.danger,
  },
  texts: {
    flex: 1,
    gap: SPACING.xs,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
});
