// AI-assisted: see docs/AI_LOG.md #1, #11
import { useRef, useState } from 'react';
import { Keyboard, StyleSheet } from 'react-native';

import AppButton from '../../components/AppButton.js';
import AuthLayout from '../../components/AuthLayout.js';
import TextField from '../../components/form/TextField.js';
import InlineMessage from '../../components/InlineMessage.js';
import { SPACING } from '../../constants/theme.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import useForm from '../../hooks/useForm.js';
import { ERROR_CODES } from '../../services/serviceError.js';
import { EMPTY_LOGIN, validateLogin } from '../../validation/loginForm.js';

// Errores de autenticación con mensaje propio; cualquier otro se muestra como "inesperado".
const LOGIN_ERROR_CODES = [ERROR_CODES.INVALID_CREDENTIALS, ERROR_CODES.TOO_MANY_REQUESTS, ERROR_CODES.NETWORK];

export default function LoginScreen({ navigation }) {
  const { t } = usePreferences();
  const { signIn } = useAuth();
  const passwordRef = useRef(null);

  const { values, errors, setValue, touchField, validateForm } = useForm(EMPTY_LOGIN, validateLogin);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authErrorCode, setAuthErrorCode] = useState(null);

  // Al volver a escribir se oculta el error del intento anterior.
  const handleChange = (field) => (text) => {
    setValue(field, text);
    setAuthErrorCode(null);
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }
    Keyboard.dismiss();
    setAuthErrorCode(null);
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn({ email: values.email, password: values.password });
      // Éxito: Firebase avisa la nueva sesión y RootNavigator muestra el módulo del conductor.
    } catch (error) {
      setAuthErrorCode(LOGIN_ERROR_CODES.includes(error.code) ? error.code : ERROR_CODES.UNKNOWN);
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t('login.title')}
      footerText={t('login.noAccount')}
      footerAction={t('login.createAccount')}
      onFooterPress={() => navigation.navigate('SignUp')}
    >
      <TextField
        label={t('login.emailLabel')}
        placeholder={t('login.emailPlaceholder')}
        icon="mail-outline"
        value={values.email}
        onChangeText={handleChange('email')}
        onBlur={() => touchField('email')}
        error={errors.email}
        editable={!isSubmitting}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      <TextField
        ref={passwordRef}
        label={t('login.passwordLabel')}
        placeholder={t('login.passwordPlaceholder')}
        icon="lock-closed-outline"
        secureToggle
        value={values.password}
        onChangeText={handleChange('password')}
        onBlur={() => touchField('password')}
        error={errors.password}
        editable={!isSubmitting}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />

      <InlineMessage tone="danger" message={authErrorCode ? t(`login.errors.${authErrorCode}`) : null} />

      <AppButton
        title={isSubmitting ? t('login.submitting') : t('login.submit')}
        loading={isSubmitting}
        onPress={handleSubmit}
        style={styles.submit}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  submit: {
    marginTop: SPACING.xs,
  },
});
