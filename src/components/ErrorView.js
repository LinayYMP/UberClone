// AI-assisted: see docs/AI_LOG.md #1
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS, MAX_CONTENT_WIDTH, SPACING, TYPOGRAPHY } from '../constants/theme.js';
import AppButton from './AppButton.js';

// Estado de error a pantalla completa con botón para reintentar.
// `children` permite agregar acciones extra (por ejemplo, cerrar sesión).
export default function ErrorView({ message, retryLabel, onRetry, children }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="cloud-offline-outline" size={48} color={COLORS.textMuted} />
        <Text style={styles.message} accessibilityRole="alert">
          {message}
        </Text>
        <AppButton title={retryLabel} icon="refresh" onPress={onRetry} style={styles.button} />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  content: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignItems: 'center',
    gap: SPACING.lg,
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
  },
});
