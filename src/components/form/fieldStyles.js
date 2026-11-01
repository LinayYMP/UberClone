// AI-assisted: see docs/AI_LOG.md #1
import { Platform, StyleSheet } from 'react-native';

import { COLORS, RADIUS, SPACING } from '../../constants/theme.js';

// Caja visual compartida por TextField, SelectField y DateField para que todos los campos se vean iguales.
export const fieldStyles = StyleSheet.create({
  box: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },
  focused: {
    borderColor: COLORS.focus,
  },
  invalid: {
    borderColor: COLORS.danger,
  },
  disabled: {
    backgroundColor: COLORS.surfaceMuted,
  },
  // fontSize 16: evita que el navegador del celular haga zoom al enfocar el campo (versión web).
  value: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
    ...Platform.select({ web: { outlineStyle: 'none' }, default: {} }),
  },
  placeholder: {
    color: COLORS.textMuted,
  },
});
