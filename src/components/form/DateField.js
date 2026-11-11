// AI-assisted: see docs/AI_LOG.md #1
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { COLORS } from '../../constants/theme.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { DATE_LOCALES } from '../../i18n/index.js';
import { formatDisplayDate, parseISODate, toISODate } from '../../utils/dates.js';
import AppButton from '../AppButton.js';
import BottomSheet from '../BottomSheet.js';
import FormField from './FormField.js';
import PickerTrigger from './PickerTrigger.js';

// Selector de fecha nativo. Android abre el diálogo del sistema; iOS muestra la rueda dentro de
// una hoja inferior con botón Confirmar. La versión web está en DateField.web.js.
// `value` es texto 'AAAA-MM-DD' (o '' si no hay fecha).
export default function DateField({ label, placeholder, value, onChange, onBlur, error, hint, maximumDate, minimumDate }) {
  const { t, language } = usePreferences();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(null);

  // Sin fecha elegida, el calendario abre en la fecha máxima permitida (p. ej. hace 18 años).
  const initialDate = parseISODate(value) ?? maximumDate ?? new Date();

  const commit = (date) => {
    setIsSheetOpen(false);
    onChange(toISODate(date));
  };

  const close = () => {
    setIsSheetOpen(false);
    onBlur?.();
  };

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initialDate,
        mode: 'date',
        maximumDate,
        minimumDate,
        onValueChange: (event, date) => commit(date),
        onDismiss: close,
      });
      return;
    }
    setDraftDate(initialDate);
    setIsSheetOpen(true);
  };

  return (
    <FormField label={label} error={error} hint={hint}>
      <PickerTrigger
        label={label}
        displayValue={formatDisplayDate(value, language)}
        placeholder={placeholder}
        icon="calendar-outline"
        trailingIcon="chevron-down"
        invalid={Boolean(error)}
        onPress={open}
      />
      {Platform.OS === 'ios' ? (
        <BottomSheet visible={isSheetOpen} onClose={close} title={label}>
          <View style={styles.pickerWrap}>
            <DateTimePicker
              value={draftDate ?? initialDate}
              mode="date"
              display="spinner"
              locale={DATE_LOCALES[language]}
              maximumDate={maximumDate}
              minimumDate={minimumDate}
              themeVariant="light"
              textColor={COLORS.textPrimary}
              onValueChange={(event, date) => setDraftDate(date)}
            />
          </View>
          <AppButton title={t('common.confirm')} onPress={() => commit(draftDate ?? initialDate)} />
        </BottomSheet>
      ) : null}
    </FormField>
  );
}

const styles = StyleSheet.create({
  pickerWrap: {
    alignItems: 'center',
  },
});
