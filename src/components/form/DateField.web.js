// AI-assisted: see docs/AI_LOG.md #1
import { useState } from 'react';
import { View } from 'react-native';

import { COLORS } from '../../constants/theme.js';
import { toISODate } from '../../utils/dates.js';
import { fieldStyles } from './fieldStyles.js';
import FormField from './FormField.js';

// Versión web del selector de fecha: @react-native-community/datetimepicker no funciona en la web,
// así que se usa el <input type="date"> del navegador. Metro elige este archivo solo en la web.
export default function DateField({ label, value, onChange, onBlur, error, hint, maximumDate, minimumDate }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <FormField label={label} error={error} hint={hint}>
      {/* Sin icono propio: el navegador ya muestra el suyo para abrir el calendario. */}
      <View style={[fieldStyles.box, isFocused && fieldStyles.focused, error && fieldStyles.invalid]}>
        <input
          type="date"
          value={value}
          max={maximumDate ? toISODate(maximumDate) : undefined}
          min={minimumDate ? toISODate(minimumDate) : undefined}
          aria-label={label}
          aria-invalid={Boolean(error)}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          style={inputStyle}
        />
      </View>
    </FormField>
  );
}

const inputStyle = {
  flex: 1,
  minHeight: 48,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: 16,
  fontFamily: 'inherit',
  color: COLORS.textPrimary,
};
