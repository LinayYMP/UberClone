// AI-assisted: see docs/AI_LOG.md #11
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SPACING } from '../constants/theme.js';
import AppButton from './AppButton.js';
import BottomSheet from './BottomSheet.js';
import InlineMessage from './InlineMessage.js';

// Confirmación en hoja inferior (Alert con botones no funciona en la web). Muestra carga mientras
// `onConfirm` termina y, si falla, el mensaje `errorMessage` dentro de la hoja.
export default function ConfirmSheet({ visible, onClose, title, message, confirmLabel, cancelLabel, onConfirm, variant = 'primary', errorMessage }) {
  const [isRunning, setIsRunning] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleConfirm = async () => {
    setIsRunning(true);
    setHasError(false);
    try {
      await onConfirm();
      onClose();
    } catch {
      setHasError(true);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={isRunning ? undefined : onClose} title={title} description={message}>
      <View style={styles.actions}>
        {hasError ? <InlineMessage tone="danger" message={errorMessage} /> : null}
        <AppButton title={confirmLabel} variant={variant} loading={isRunning} onPress={handleConfirm} />
        <AppButton title={cancelLabel} variant="secondary" disabled={isRunning} onPress={onClose} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: SPACING.sm,
  },
});
