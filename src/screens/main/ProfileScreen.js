// AI-assisted: see docs/AI_LOG.md #11
import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import SegmentedField from '../../components/form/SegmentedField.js';
import LogoutButton from '../../components/LogoutButton.js';
import SectionCard from '../../components/SectionCard.js';
import { COLORS, MAX_CONTENT_WIDTH, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useRegistration } from '../../context/RegistrationContext.js';
import { LANGUAGES } from '../../i18n/index.js';

// Perfil y configuración: datos personales, vehículo y documentos editables, idioma y cierre de sesión.
export default function ProfileScreen({ navigation }) {
  const { t, language, setLanguage } = usePreferences();
  const { registration } = useRegistration();
  const { personalData, vehicle } = registration;

  const languageOptions = useMemo(
    () => LANGUAGES.map((id) => ({ value: id, label: t(`options.language.${id}`) })),
    [t],
  );

  const rows = [
    {
      key: 'EditPersonalData',
      icon: 'person-outline',
      title: t('profile.personalData'),
      detail: personalData ? `${personalData.fullName} · ${personalData.phone}` : '',
    },
    {
      key: 'EditVehicle',
      icon: 'car-outline',
      title: t('profile.vehicle'),
      detail: vehicle ? `${vehicle.brand} ${vehicle.model} · ${vehicle.plate}` : '',
    },
    { key: 'EditDocuments', icon: 'document-text-outline', title: t('profile.documents'), detail: '' },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.inner}>
        <View style={styles.header}>
          {personalData?.photoUri ? (
            <Image source={{ uri: personalData.photoUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={36} color={COLORS.textMuted} />
            </View>
          )}
          <View style={styles.headerTexts}>
            <Text style={styles.name}>{personalData?.fullName ?? registration.email}</Text>
            <Text style={styles.email}>{registration.email}</Text>
            <Text style={styles.status}>{t(`registration.accountStatus.${registration.accountStatus}`)}</Text>
          </View>
        </View>

        <View style={styles.list}>
          {rows.map((row) => (
            <Pressable
              key={row.key}
              onPress={() => navigation.navigate(row.key, { mode: 'profile' })}
              accessibilityRole="button"
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <Ionicons name={row.icon} size={22} color={COLORS.textPrimary} />
              <View style={styles.rowTexts}>
                <Text style={styles.rowTitle}>{row.title}</Text>
                {row.detail ? (
                  <Text style={styles.rowDetail} numberOfLines={1}>
                    {row.detail}
                  </Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </Pressable>
          ))}
        </View>

        <SectionCard title={t('profile.language')}>
          <SegmentedField options={languageOptions} value={language} onChange={setLanguage} />
        </SectionCard>

        <LogoutButton variant="row" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  inner: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    gap: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceMuted,
  },
  headerTexts: {
    flex: 1,
    gap: SPACING.xxs,
  },
  name: {
    ...TYPOGRAPHY.title,
    color: COLORS.textPrimary,
  },
  email: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  status: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.success,
  },
  list: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  pressed: {
    backgroundColor: COLORS.surfaceMuted,
  },
  rowTexts: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  rowDetail: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});
