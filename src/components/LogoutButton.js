// AI-assisted: see docs/AI_LOG.md #1
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { COLORS, RADIUS, SPACING } from '../constants/theme.js';
import { useAuth } from '../context/AuthContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import AppButton from './AppButton.js';
import BottomSheet from './BottomSheet.js';

// Botón del encabezado para cerrar sesión, con confirmación en una hoja inferior
// (Alert con botones no funciona en la versión web).
export default function LogoutButton() {
  const { t } = usePreferences();
  const { signOut } = useAuth();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Al terminar, AuthContext pasa a "signedOut" y RootNavigator vuelve al login
  // (este componente se desmonta, por eso no se vuelve a cambiar el estado).
  const handleConfirm = async () => {
    setIsSigningOut(true);
    await signOut();
  };

  return (
    <>
      <Pressable
        onPress={() => setIsConfirmOpen(true)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('session.logout')}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        <Ionicons name="log-out-outline" size={24} color={COLORS.textPrimary} />
      </Pressable>

      <BottomSheet
        visible={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={t('session.logoutTitle')}
        description={t('session.logoutMessage')}
      >
        <View style={styles.actions}>
          <AppButton title={t('session.logout')} variant="danger" icon="log-out-outline" loading={isSigningOut} onPress={handleConfirm} />
          <AppButton title={t('common.cancel')} variant="secondary" disabled={isSigningOut} onPress={() => setIsConfirmOpen(false)} />
        </View>
      </BottomSheet>
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
  pressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  actions: {
    gap: SPACING.sm,
  },
});
