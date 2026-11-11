// AI-assisted: see docs/AI_LOG.md #1
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme.js';

const TONES = {
  danger: { icon: 'alert-circle', color: COLORS.danger, background: COLORS.dangerSoft },
  success: { icon: 'checkmark-circle', color: COLORS.success, background: COLORS.successSoft },
  warning: { icon: 'warning', color: COLORS.warning, background: COLORS.warningSoft },
  info: { icon: 'information-circle', color: COLORS.info, background: COLORS.infoSoft },
};

// Mensaje dentro de la pantalla (errores de autenticación, guardado exitoso...). Reemplaza a
// Alert: el mensaje queda visible junto a la acción que lo produjo y lo anuncia el lector de pantalla.
export default function InlineMessage({ tone = 'info', message, style }) {
  if (!message) {
    return null;
  }
  const palette = TONES[tone] ?? TONES.info;

  return (
    <View
      accessibilityRole={tone === 'danger' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
      style={[styles.container, { backgroundColor: palette.background, borderLeftColor: palette.color }, style]}
    >
      <Ionicons name={palette.icon} size={20} color={palette.color} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    borderLeftWidth: 4,
  },
  text: {
    ...TYPOGRAPHY.caption,
    flex: 1,
    color: COLORS.textPrimary,
    lineHeight: 19,
  },
});
