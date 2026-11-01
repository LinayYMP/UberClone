// AI-assisted: see docs/AI_LOG.md #1
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { COLORS, RADIUS, SPACING, TOUCH_TARGET } from '../constants/theme.js';

// Botón reutilizable con variantes y estado de carga. Se usa Pressable porque Button no
// permite personalizar el estilo. Mientras `loading` es true no se puede volver a tocar.
export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  accessibilityHint,
}) {
  const palette = VARIANTS[variant] ?? VARIANTS.primary;
  const isDisabled = disabled || loading;
  const contentColor = palette.text.color;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.button,
        palette.button,
        pressed && styles.pressed,
        disabled && !loading && styles.disabled,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={contentColor} /> : null}
      {!loading && icon ? <Ionicons name={icon} size={20} color={contentColor} /> : null}
      <Text style={[styles.text, palette.text]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: TOUCH_TARGET + 6,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.45,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
});

const VARIANTS = {
  primary: StyleSheet.create({
    button: { backgroundColor: COLORS.brand },
    text: { color: COLORS.textOnBrand },
  }),
  secondary: StyleSheet.create({
    button: { backgroundColor: COLORS.surfaceMuted },
    text: { color: COLORS.textPrimary },
  }),
  danger: StyleSheet.create({
    button: { backgroundColor: COLORS.danger },
    text: { color: COLORS.textOnBrand },
  }),
};
