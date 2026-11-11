// AI-assisted: see docs/AI_LOG.md #1, #11
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, MAX_CONTENT_WIDTH, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme.js';
import { usePreferences } from '../context/PreferencesContext.js';

// Estructura común de Iniciar sesión y Crear cuenta: encabezado negro de marca, hoja blanca con el
// formulario y un enlace al pie para cambiar entre las dos pantallas.
export default function AuthLayout({ title, footerText, footerAction, onFooterPress, children }) {
  const { t } = usePreferences();
  const insets = useSafeAreaInsets();

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
              {title}
            </Text>
            {children}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{footerText}</Text>
              <Pressable onPress={onFooterPress} hitSlop={8} accessibilityRole="link">
                <Text style={styles.footerLink}>{footerAction}</Text>
              </Pressable>
            </View>
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
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingTop: SPACING.sm,
  },
  footerText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textDecorationLine: 'underline',
  },
});
