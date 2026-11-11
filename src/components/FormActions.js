// AI-assisted: see docs/AI_LOG.md #1
import { StyleSheet, View } from 'react-native';

import { SPACING } from '../constants/theme.js';
import { usePreferences } from '../context/PreferencesContext.js';
import AppButton from './AppButton.js';
import InlineMessage from './InlineMessage.js';

// Pie de los formularios del registro: aviso de campos por corregir, resultado del guardado y botón.
// feedback = { tone, key } | null
export default function FormActions({ errorCount, feedback, submitTitle, submitIcon, isSaving, onSubmit }) {
  const { t } = usePreferences();

  let invalidMessage = null;
  if (errorCount === 1) {
    invalidMessage = t('registration.invalidFieldsOne');
  } else if (errorCount > 1) {
    invalidMessage = t('registration.invalidFieldsOther', { count: errorCount });
  }

  return (
    <View style={styles.container}>
      <InlineMessage tone="danger" message={invalidMessage} />
      <InlineMessage tone={feedback?.tone} message={feedback ? t(feedback.key) : null} />
      <AppButton
        title={isSaving ? t('common.saving') : submitTitle}
        icon={submitIcon}
        loading={isSaving}
        onPress={onSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
});
