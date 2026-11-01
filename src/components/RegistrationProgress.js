// AI-assisted: see docs/AI_LOG.md #1
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { ACCOUNT_STATUS, REGISTRATION_SECTIONS } from '../constants/registration.js';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../constants/theme.js';
import { usePreferences } from '../context/PreferencesContext.js';

const SECTION_ICONS = {
  personalData: 'person-outline',
  vehicle: 'car-outline',
  documents: 'document-text-outline',
};

const STATUS_DOT_COLORS = {
  [ACCOUNT_STATUS.INCOMPLETE]: COLORS.onBrandWarning,
  [ACCOUNT_STATUS.PENDING_APPROVAL]: COLORS.onBrandInfo,
  [ACCOUNT_STATUS.APPROVED]: COLORS.onBrandSuccess,
};

// Resumen del registro: estado de la cuenta y avance de las tres pestañas.
// progress: { personalData: bool, vehicle: bool, documents: bool }
export default function RegistrationProgress({ progress, completedSections, accountStatus, currentSection }) {
  const { t } = usePreferences();
  const total = REGISTRATION_SECTIONS.length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.overline}>{t('registration.progressTitle')}</Text>
          <Text style={styles.title}>{t('registration.progressCount', { done: completedSections, total })}</Text>
        </View>
        <View style={styles.statusChip}>
          <View style={[styles.statusDot, { backgroundColor: STATUS_DOT_COLORS[accountStatus] }]} />
          <Text style={styles.statusText}>{t(`registration.accountStatus.${accountStatus}`)}</Text>
        </View>
      </View>

      <View style={styles.bar}>
        {REGISTRATION_SECTIONS.map((section) => (
          <View
            key={section}
            style={[
              styles.segment,
              section === currentSection && styles.segmentCurrent,
              progress[section] && styles.segmentDone,
            ]}
          />
        ))}
      </View>

      <View style={styles.steps}>
        {REGISTRATION_SECTIONS.map((section) => {
          const isDone = progress[section];
          const isCurrent = section === currentSection;
          return (
            <View key={section} style={styles.step}>
              <Ionicons
                name={isDone ? 'checkmark-circle' : SECTION_ICONS[section]}
                size={20}
                color={isDone ? COLORS.onBrandSuccess : isCurrent ? COLORS.textOnBrand : COLORS.textOnBrandMuted}
              />
              <Text style={[styles.stepLabel, isCurrent && styles.stepLabelCurrent]} numberOfLines={2}>
                {t(`registration.tabs.${section}`)}
              </Text>
              <Text style={styles.stepStatus}>
                {isDone ? t('registration.sectionComplete') : t('registration.sectionPending')}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.rule}>{t('registration.submitRule')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.brand,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  headerText: {
    flex: 1,
    gap: SPACING.xxs,
  },
  overline: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textOnBrandMuted,
  },
  title: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textOnBrand,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.xs + 1,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.brandSoft,
    borderWidth: 1,
    borderColor: COLORS.onBrandBorder,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textOnBrand,
  },
  bar: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.onBrandBorder,
  },
  segmentCurrent: {
    backgroundColor: COLORS.onBrandTrackActive,
  },
  segmentDone: {
    backgroundColor: COLORS.onBrandSuccess,
  },
  steps: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  step: {
    flex: 1,
    gap: SPACING.xxs + 1,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textOnBrandMuted,
  },
  stepLabelCurrent: {
    color: COLORS.textOnBrand,
    fontWeight: '700',
  },
  stepStatus: {
    fontSize: 12,
    color: COLORS.textOnBrandMuted,
  },
  rule: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textOnBrandMuted,
    lineHeight: 18,
    paddingTop: SPACING.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.onBrandBorder,
  },
});
