// AI-assisted: see docs/AI_LOG.md #1
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING, TOUCH_TARGET } from '../constants/theme.js';

// Fila tocable de una hoja inferior: opción de una lista desplegable (con check y muestra de color)
// o acción con icono (tomar foto, elegir de la galería).
export default function ListOption({ label, onPress, icon, swatch, selected = false, accessibilityRole = 'button' }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={label}
      accessibilityState={{ selected, checked: accessibilityRole === 'radio' ? selected : undefined }}
      style={({ pressed }) => [styles.option, selected && styles.selected, pressed && styles.pressed]}
    >
      {icon ? (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={22} color={COLORS.textPrimary} />
        </View>
      ) : null}
      {swatch ? <View style={[styles.swatch, { backgroundColor: swatch }]} /> : null}
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {selected ? <Ionicons name="checkmark-circle" size={22} color={COLORS.brand} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    minHeight: TOUCH_TARGET + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  selected: {
    backgroundColor: COLORS.surfaceMuted,
  },
  pressed: {
    backgroundColor: COLORS.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  labelSelected: {
    fontWeight: '700',
  },
});
