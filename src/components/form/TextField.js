// AI-assisted: see docs/AI_LOG.md #1
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { COLORS } from '../../constants/theme.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { fieldStyles } from './fieldStyles.js';
import FormField from './FormField.js';

// Campo de texto con etiqueta, icono, contador de caracteres y botón para ver la contraseña.
// En React 19 `ref` llega como prop normal y se pasa al TextInput (para saltar al siguiente campo).
export default function TextField({
  ref,
  label,
  value,
  onChangeText,
  onBlur,
  error,
  hint,
  icon,
  maxLength,
  showCounter = false,
  secureToggle = false,
  editable = true,
  ...inputProps
}) {
  const { t } = usePreferences();
  const [isFocused, setIsFocused] = useState(false);
  const [isSecretVisible, setIsSecretVisible] = useState(false);
  const counter = showCounter && maxLength ? `${value.length}/${maxLength}` : null;

  return (
    <FormField label={label} counter={counter} error={error} hint={hint}>
      <View
        style={[
          fieldStyles.box,
          isFocused && fieldStyles.focused,
          error && fieldStyles.invalid,
          !editable && fieldStyles.disabled,
        ]}
      >
        {icon ? <Ionicons name={icon} size={20} color={isFocused ? COLORS.textPrimary : COLORS.textMuted} /> : null}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          maxLength={maxLength}
          secureTextEntry={secureToggle && !isSecretVisible}
          placeholderTextColor={COLORS.textMuted}
          accessibilityLabel={label}
          style={fieldStyles.value}
          onFocus={() => setIsFocused(true)}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          {...inputProps}
        />
        {secureToggle ? (
          <Pressable
            onPress={() => setIsSecretVisible((visible) => !visible)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={isSecretVisible ? t('login.hidePassword') : t('login.showPassword')}
          >
            <Ionicons name={isSecretVisible ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORS.textSecondary} />
          </Pressable>
        ) : null}
      </View>
    </FormField>
  );
}
