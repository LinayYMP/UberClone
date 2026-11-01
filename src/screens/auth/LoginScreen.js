// AI-assisted: see docs/AI_LOG.md #1
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Keyboard, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppButton from '../../components/AppButton.js';
import TextField from '../../components/form/TextField.js';
import InlineMessage from '../../components/InlineMessage.js';
import { COLORS, MAX_CONTENT_WIDTH, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import useForm from '../../hooks/useForm.js';
import { ERROR_CODES } from '../../services/serviceError.js';
import { EMPTY_LOGIN, validateLogin } from '../../validation/loginForm.js';

// Errores de autenticación con mensaje propio; cualquier otro se muestra como "inesperado".
const LOGIN_ERROR_CODES = [ERROR_CODES.INVALID_CREDENTIALS, ERROR_CODES.NETWORK];

export default function LoginScreen() {
  const { t } = usePreferences();
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();
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
      // Éxito: AuthContext pasa a "signedIn" y RootNavigator muestra el módulo del conductor.
    } catch (error) {
      setAuthErrorCode(LOGIN_ERROR_CODES.includes(error.code) ? error.code : ERROR_CODES.UNKNOWN);
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        automaticallyAdjustKeyboardInsets
        bounces={false}
      >
        <View style={[styles.hero, { paddingTop: insets.top + SPACING.xl }]}>
          <View style={styles.heroContent}>
            <View style={styles.brandRow}>
              <View style={styles.logoMark}>
                <Ionicons name="car-sport" size={22} color={COLORS.brand} />
              </View>
              <Text style={styles.brandName}>{t('app.name')}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{t('app.driverBadge')}</Text>
              </View>
            </View>
            <Text style={styles.heroTitle} accessibilityRole="header">
              {t('login.heroTitle')}
            </Text>
            <Text style={styles.heroSubtitle}>{t('login.heroSubtitle')}</Text>
          </View>
        </View>

        <View style={[styles.sheet, { paddingBottom: insets.bottom + SPACING.xl }]}>
          <View style={styles.form}>
            <Text style={styles.title} accessibilityRole="header">
              {t('login.title')}
            </Text>

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
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.brand,
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl + SPACING.lg,
  },
  heroContent: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    gap: SPACING.md,
  },
  brandRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: COLORS.textOnBrand,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs + 1,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.onBrandBorder,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textOnBrandMuted,
  },
  heroTitle: {
    ...TYPOGRAPHY.display,
    color: COLORS.textOnBrand,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textOnBrandMuted,
    lineHeight: 22,
  },
  sheet: {
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  form: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    gap: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
  },
  submit: {
    marginTop: SPACING.xs,
  },
});
