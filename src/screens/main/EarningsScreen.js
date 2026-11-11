// AI-assisted: see docs/AI_LOG.md #11
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import ErrorView from '../../components/ErrorView.js';
import FilterChips from '../../components/FilterChips.js';
import LoadingView from '../../components/LoadingView.js';
import { COLORS, MAX_CONTENT_WIDTH, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useRegistration } from '../../context/RegistrationContext.js';
import useEarnings from '../../hooks/useEarnings.js';
import { EARNINGS_PERIODS, formatCOP } from '../../utils/earnings.js';

// Ganancias de hoy, la semana y el mes: viajes, total facturado, comisiones, propinas, ganancia
// neta y promedio por viaje (useMemo dentro de useEarnings), más el saldo del conductor.
export default function EarningsScreen() {
  const { t } = usePreferences();
  const { driverId } = useRegistration();
  const { summaries, balance, status, reload } = useEarnings(driverId);
  const [period, setPeriod] = useState('today');

  const periodOptions = useMemo(
    () => EARNINGS_PERIODS.map((value) => ({ value, label: t(`earnings.periods.${value}`) })),
    [t],
  );

  if (status === 'loading') {
    return <LoadingView message={t('common.loading')} />;
  }
  if (status === 'error') {
    return <ErrorView message={t('earnings.loadError')} retryLabel={t('common.retry')} onRetry={reload} />;
  }

  const summary = summaries[period];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.inner}>
        <FilterChips options={periodOptions} value={period} onChange={setPeriod} accessibilityLabel={t('earnings.title')} />

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>{t('earnings.net')}</Text>
          <Text style={styles.heroValue}>{formatCOP(summary.netEarnings)}</Text>
          <Text style={styles.heroCaption}>
            {summary.tripCount === 1 ? t('earnings.tripCountOne') : t('earnings.tripCountOther', { count: summary.tripCount })}
          </Text>
        </View>

        <View style={styles.grid}>
          <Stat label={t('earnings.trips')} value={String(summary.tripCount)} />
          <Stat label={t('earnings.billed')} value={formatCOP(summary.totalFare)} />
          <Stat label={t('earnings.commissions')} value={formatCOP(summary.totalCommission)} />
          <Stat label={t('earnings.tips')} value={formatCOP(summary.totalTips)} />
          <Stat label={t('earnings.average')} value={formatCOP(summary.averagePerTrip)} wide />
        </View>

        <View style={styles.balance}>
          <Text style={styles.balanceLabel}>{t('earnings.balance')}</Text>
          <Text style={[styles.balanceValue, balance < 0 && styles.negative]}>{formatCOP(balance)}</Text>
          <Text style={styles.balanceHint}>{t('earnings.balanceHint')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function Stat({ label, value, wide = false }) {
  return (
    <View style={[styles.stat, wide && styles.statWide]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
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
  hero: {
    backgroundColor: COLORS.brand,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    gap: SPACING.xs,
  },
  heroLabel: {
    ...TYPOGRAPHY.overline,
    color: COLORS.textOnBrandMuted,
  },
  heroValue: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -0.8,
    color: COLORS.textOnBrand,
  },
  heroCaption: {
    ...TYPOGRAPHY.body,
    color: COLORS.textOnBrandMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  stat: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  statWide: {
    flexBasis: '100%',
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  balance: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  balanceLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.success,
  },
  negative: {
    color: COLORS.danger,
  },
  balanceHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
