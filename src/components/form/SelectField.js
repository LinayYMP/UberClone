// AI-assisted: see docs/AI_LOG.md #1
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { SPACING } from '../../constants/theme.js';
import BottomSheet from '../BottomSheet.js';
import ListOption from '../ListOption.js';
import FormField from './FormField.js';
import PickerTrigger from './PickerTrigger.js';

// Lista desplegable: el campo abre una hoja inferior con las opciones.
// options: [{ value, label, swatch? }]. Cerrar la hoja sin elegir llama a onBlur (marca el campo).
export default function SelectField({ label, placeholder, value, options, onChange, onBlur, error, hint, icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  const handleSelect = (optionValue) => {
    setIsOpen(false);
    onChange(optionValue);
  };

  const handleClose = () => {
    setIsOpen(false);
    onBlur?.();
  };

  return (
    <FormField label={label} error={error} hint={hint}>
      <PickerTrigger
        label={label}
        displayValue={selected?.label}
        placeholder={placeholder}
        icon={icon}
        swatch={selected?.swatch}
        trailingIcon="chevron-down"
        invalid={Boolean(error)}
        onPress={() => setIsOpen(true)}
      />
      <BottomSheet visible={isOpen} onClose={handleClose} title={label}>
        <ScrollView contentContainerStyle={styles.list} bounces={false}>
          {options.map((option) => (
            <ListOption
              key={option.value}
              label={option.label}
              swatch={option.swatch}
              selected={option.value === value}
              accessibilityRole="radio"
              onPress={() => handleSelect(option.value)}
            />
          ))}
        </ScrollView>
      </BottomSheet>
    </FormField>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: SPACING.xxs,
  },
});
