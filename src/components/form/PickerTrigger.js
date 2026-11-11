// AI-assisted: see docs/AI_LOG.md #1
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS } from '../../constants/theme.js';
import { fieldStyles } from './fieldStyles.js';

// Caja tocable que muestra el valor elegido en una lista desplegable o en el selector de fecha.
export default function PickerTrigger({ label, displayValue, placeholder, icon, swatch, trailingIcon, onPress, invalid }) {
  const hasValue = Boolean(displayValue);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={hasValue ? `${label}: ${displayValue}` : label}
      style={({ pressed }) => [fieldStyles.box, invalid && fieldStyles.invalid, pressed && styles.pressed]}
    >
      {icon ? <Ionicons name={icon} size={20} color={COLORS.textMuted} /> : null}
      {swatch ? <View style={[styles.swatch, { backgroundColor: swatch }]} /> : null}
      <Text style={[fieldStyles.value, !hasValue && fieldStyles.placeholder]} numberOfLines={1}>
        {hasValue ? displayValue : placeholder}
      </Text>
      {trailingIcon ? <Ionicons name={trailingIcon} size={20} color={COLORS.textSecondary} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  swatch: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
});
