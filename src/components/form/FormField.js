// AI-assisted: see docs/AI_LOG.md #1
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme.js';
import { usePreferences } from '../../context/PreferencesContext.js';

// Envoltorio común de todos los campos: etiqueta, contador opcional y, debajo del campo,
// el error (traducido) o una ayuda. El documento pide los errores debajo de cada campo, no en un Alert.
// `error` es { key, params } (ver utils/validators.js).
export default function FormField({ label, counter, error, hint, children, style }) {
  const { t } = usePreferences();
  const message = error ? t(error.key, error.params) : hint;

  return (
    <View style={[styles.field, style]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {counter ? <Text style={styles.counter}>{counter}</Text> : null}
        </View>
      ) : null}
      {children}
      {message ? (
        <View style={styles.messageRow} accessibilityLiveRegion={error ? 'polite' : 'none'}>
          {error ? <Ionicons name="alert-circle" size={15} color={COLORS.danger} style={styles.messageIcon} /> : null}
          <Text style={[styles.message, error && styles.error]}>{message}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: SPACING.xs + 2,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    ...TYPOGRAPHY.label,
    color: COLORS.textPrimary,
  },
  counter: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  messageIcon: {
    marginTop: 2,
  },
  message: {
    ...TYPOGRAPHY.caption,
    flex: 1,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  error: {
    color: COLORS.danger,
    fontWeight: '500',
  },
});
