// AI-assisted: see docs/AI_LOG.md #11
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import ErrorView from '../../components/ErrorView.js';
import FilterChips from '../../components/FilterChips.js';
import DateField from '../../components/form/DateField';
import InlineMessage from '../../components/InlineMessage.js';
import TripListItem from '../../components/TripListItem.js';
import { COLORS, MAX_CONTENT_WIDTH, SPACING, TYPOGRAPHY } from '../../constants/theme.js';
import { PAYMENT_METHODS } from '../../constants/trips.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useRegistration } from '../../context/RegistrationContext.js';
import useTripHistory from '../../hooks/useTripHistory.js';
import { HISTORY_PERIODS, isValidRange, resolveHistoryRange } from '../../utils/historyFilters.js';

const PAYMENT_FILTERS = ['all', PAYMENT_METHODS.MERCADOPAGO, PAYMENT_METHODS.STRIPE, PAYMENT_METHODS.CASH];

// Historial de carreras con FlatList, del más reciente al más antiguo, filtros Hoy, Semana, Mes y
// Rango de fechas y filtro por método de pago. Carga 20 viajes y trae más al llegar al final.
export default function HistoryScreen({ navigation }) {
  const { t } = usePreferences();
  const { driverId } = useRegistration();
  const [period, setPeriod] = useState('month');
  const [range, setRange] = useState({ from: '', to: '' });
  const [paymentFilter, setPaymentFilter] = useState('all');

  const rangeIsValid = period !== 'range' || isValidRange(range);
  const filters = useMemo(() => {
    const { from, to } = rangeIsValid ? resolveHistoryRange(period, range) : { from: null, to: null };
    return { from, to, paymentMethod: paymentFilter === 'all' ? null : paymentFilter };
  }, [period, range, paymentFilter, rangeIsValid]);

  const { trips, status, loadMore, reload } = useTripHistory(driverId, filters, rangeIsValid);

  const periodOptions = useMemo(
    () => HISTORY_PERIODS.map((value) => ({ value, label: value === 'range' ? t('history.range') : t(`earnings.periods.${value}`) })),
    [t],
  );
  const paymentOptions = useMemo(
    () => PAYMENT_FILTERS.map((value) => ({ value, label: t(`paymentMethod.${value}`) })),
    [t],
  );

  const header = (
    <View style={styles.filters}>
      <FilterChips options={periodOptions} value={period} onChange={setPeriod} accessibilityLabel={t('history.title')} />
      {period === 'range' ? (
        <View style={styles.rangeRow}>
          <View style={styles.flex}>
            <DateField
              label={t('history.from')}
              placeholder={t('documents.expiryPlaceholder')}
              value={range.from}
              maximumDate={new Date()}
              onChange={(from) => setRange((current) => ({ ...current, from }))}
            />
          </View>
          <View style={styles.flex}>
            <DateField
              label={t('history.to')}
              placeholder={t('documents.expiryPlaceholder')}
              value={range.to}
              maximumDate={new Date()}
              onChange={(to) => setRange((current) => ({ ...current, to }))}
            />
          </View>
        </View>
      ) : null}
      {!rangeIsValid ? <InlineMessage tone="info" message={t('history.rangeInvalid')} /> : null}
      <Text style={styles.filterLabel}>{t('history.paymentFilter')}</Text>
      <FilterChips options={paymentOptions} value={paymentFilter} onChange={setPaymentFilter} accessibilityLabel={t('history.paymentFilter')} />
    </View>
  );

  if (status === 'error') {
    return <ErrorView message={t('history.loadError')} retryLabel={t('common.retry')} onRetry={reload} />;
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={rangeIsValid ? trips : []}
      keyExtractor={(trip) => trip.id}
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <TripListItem trip={item} onPress={() => navigation.navigate('TripDetail', { tripId: item.id })} />
        </View>
      )}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      ListEmptyComponent={
        rangeIsValid && status === 'ready' ? (
          <View style={styles.empty}>
            <Ionicons name="car-outline" size={44} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>{t('history.empty')}</Text>
          </View>
        ) : null
      }
      ListFooterComponent={
        (status === 'loading' || status === 'loadingMore') && rangeIsValid ? (
          <ActivityIndicator style={styles.loader} color={COLORS.brand} />
        ) : null
      }
    />
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
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  flex: {
    flex: 1,
  },
  filters: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  filterLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
  },
  item: {
    marginBottom: SPACING.md,
  },
  empty: {
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  loader: {
    marginVertical: SPACING.lg,
  },
});
