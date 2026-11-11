// AI-assisted: see docs/AI_LOG.md #1, #11
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { COLORS, RADIUS, SPACING } from '../constants/theme.js';
import { useAuth } from '../context/AuthContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import ConfirmSheet from './ConfirmSheet.js';

// Cerrar sesión con confirmación. variant="icon" para el encabezado del registro;
// variant="row" para la pantalla Perfil y configuración.
export default function LogoutButton({ variant = 'icon' }) {
  const { t } = usePreferences();
  const { signOut } = useAuth();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const isRow = variant === 'row';

  return (
    <>
      <Pressable
        onPress={() => setIsConfirmOpen(true)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('session.logout')}
        style={({ pressed }) => [isRow ? styles.row : styles.iconButton, pressed && styles.pressed]}
      >
        <Ionicons name="log-out-outline" size={isRow ? 22 : 24} color={isRow ? COLORS.danger : COLORS.textPrimary} />
        {isRow ? <Text style={styles.rowText}>{t('session.logout')}</Text> : null}
      </Pressable>

      {/* Al cerrar sesión, AuthContext pasa a "signedOut" y RootNavigator vuelve al login. */}
      <ConfirmSheet
        visible={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={t('session.logoutTitle')}
        message={t('session.logoutMessage')}
        confirmLabel={t('session.logout')}
        cancelLabel={t('common.cancel')}
        variant="danger"
        onConfirm={signOut}
      />
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.pill,
    marginRight: SPACING.sm,
  },
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  rowText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.danger,
  },
  pressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
});
