// AI-assisted: see docs/AI_LOG.md #1
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import { COLORS, MAX_CONTENT_WIDTH, SPACING } from '../constants/theme.js';

// Contenedor con scroll para formularios. En iOS el ScrollView agrega el espacio del teclado
// (automaticallyAdjustKeyboardInsets); en Android la ventana se ajusta sola al teclado.
export default function FormScrollView({ children }) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      automaticallyAdjustKeyboardInsets
    >
      <View style={styles.inner}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  inner: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    gap: SPACING.lg,
  },
});
