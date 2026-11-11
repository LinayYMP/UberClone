// AI-assisted: see docs/AI_LOG.md #1
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme.js';

// Tarjeta que agrupa campos relacionados de un formulario.
export default function SectionCard({ title, children, style }) {
  return (
    <View style={[styles.card, style]}>
      {title ? (
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textSecondary,
  },
});
