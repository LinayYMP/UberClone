// AI-assisted: see docs/AI_LOG.md #11
import { useRef, useState } from 'react';
import { Keyboard, StyleSheet, Text } from 'react-native';

import AppButton from '../../components/AppButton.js';
import AuthLayout from '../../components/AuthLayout.js';
import TextField from '../../components/form/TextField.js';
import InlineMessage from '../../components/InlineMessage.js';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import useForm from '../../hooks/useForm.js';
import { ERROR_CODES } from '../../services/serviceError.js';
import { EMPTY_SIGN_UP, validateSignUp } from '../../validation/signUpForm.js';

const SIGN_UP_ERROR_CODES = [ERROR_CODES.EMAIL_IN_USE, ERROR_CODES.WEAK_PASSWORD, ERROR_CODES.NETWORK];

// Crear cuenta con Firebase Authentication. Al crearla, la sesión queda iniciada y la app abre
// el registro del conductor (pestañas Datos personales, Vehículo y Documentos).
export default function SignUpScreen({ navigation }) {
  const { t } = usePreferences();
  const { signUp } = useAuth();
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const { values, errors, setValue, touchField, validateForm } = useForm(EMPTY_SIGN_UP, validateSignUp);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorCode, setErrorCode] = useState(null);

  const handleChange = (field) => (text) => {
    setValue(field, text);
    setErrorCode(null);
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }
    Keyboard.dismiss();
    setErrorCode(null);
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await signUp({ email: values.email, password: values.password });
    } catch (error) {
      setErrorCode(SIGN_UP_ERROR_CODES.includes(error.code) ? error.code : ERROR_CODES.UNKNOWN);
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t('signUp.title')}
      footerText={t('signUp.haveAccount')}
      footerAction={t('signUp.signIn')}
      onFooterPress={() => navigation.goBack()}
    >
      <Text style={styles.subtitle}>{t('signUp.subtitle')}</Text>

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
        label={t('signUp.passwordLabel')}
        placeholder={t('signUp.passwordPlaceholder')}
        icon="lock-closed-outline"
        secureToggle
        value={values.password}
        onChangeText={handleChange('password')}
        onBlur={() => touchField('password')}
        error={errors.password}
        editable={!isSubmitting}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => confirmRef.current?.focus()}
      />
      <TextField
        ref={confirmRef}
        label={t('signUp.confirmLabel')}
        placeholder={t('signUp.confirmPlaceholder')}
        icon="lock-closed-outline"
        secureToggle
        value={values.confirmPassword}
        onChangeText={handleChange('confirmPassword')}
        onBlur={() => touchField('confirmPassword')}
        error={errors.confirmPassword}
        editable={!isSubmitting}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />

      <InlineMessage tone="danger" message={errorCode ? t(`signUp.errors.${errorCode}`) : null} />

      <AppButton
        title={isSubmitting ? t('signUp.submitting') : t('signUp.submit')}
        loading={isSubmitting}
        onPress={handleSubmit}
        style={styles.submit}
      />
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: -SPACING.sm,
  },
  submit: {
    marginTop: SPACING.xs,
  },
});
