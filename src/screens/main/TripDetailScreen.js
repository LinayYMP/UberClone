// AI-assisted: see docs/AI_LOG.md #11
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import ErrorView from '../../components/ErrorView.js';
import FareBreakdown from '../../components/FareBreakdown.js';
import LoadingView from '../../components/LoadingView.js';
import DriverMap from '../../components/map/DriverMap';
import SectionCard from '../../components/SectionCard.js';
import StarRating from '../../components/StarRating.js';
import StatusBadge from '../../components/StatusBadge.js';
import TripRoute from '../../components/TripRoute.js';
import { COLORS, MAX_CONTENT_WIDTH, RADIUS, SPACING, TYPOGRAPHY } from '../../constants/theme.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { getTrip } from '../../services/tripService';
import { formatDateTime } from '../../utils/dates.js';

// Detalle de un viaje del historial: ruta guardada dibujada en el mapa (sin pedirla de nuevo),
// duración, distancia, comisión, propina y calificación del pasajero.
export default function TripDetailScreen({ route }) {
  const { t, language } = usePreferences();
  const { tripId } = route.params;
  const [trip, setTrip] = useState(null);
  const [status, setStatus] = useState('loading');
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isActive = true;
    getTrip(tripId)
      .then((data) => {
        if (isActive) {
          setTrip(data);
          setStatus(data ? 'ready' : 'error');
        }
      })
      .catch(() => isActive && setStatus('error'));
    return () => {
      isActive = false;
    };
  }, [tripId, reloadCount]);

  if (status === 'loading') {
    return <LoadingView message={t('common.loading')} />;
  }
  if (status === 'error') {
    return <ErrorView message={t('history.loadError')} retryLabel={t('common.retry')} onRetry={() => setReloadCount((count) => count + 1)} />;
  }

  const markers = [
    { id: 'pickup', point: trip.origin, kind: 'pickup' },
    { id: 'destination', point: trip.destination, kind: 'destination' },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.inner}>
        <View style={styles.map}>
          <DriverMap markers={markers} route={trip.route} edgePadding={{ top: 40, right: 40, bottom: 40, left: 40 }} />
        </View>
        {!trip.route ? <Text style={styles.hint}>{t('tripDetail.noRoute')}</Text> : null}

        <SectionCard>
          <View style={styles.row}>
            <Text style={styles.date}>{formatDateTime(trip.createdAt, language)}</Text>
            <StatusBadge paymentStatus={trip.paymentStatus} tripStatus={trip.status} />
          </View>
          <TripRoute originLabel={t('request.pickup')} origin={trip.origin?.address} destinationLabel={t('request.destination')} destination={trip.destination?.address} />
          <View style={styles.facts}>
            <Fact label={t('request.distance')} value={t('common.km', { value: trip.distanceKm })} />
            <Fact label={t('request.duration')} value={t('common.minutes', { value: trip.durationMin })} />
            <Fact label={t('request.category')} value={t(`options.category.${trip.category}`)} />
            <Fact label={t('request.payment')} value={t(`paymentMethod.${trip.paymentMethod}`)} />
          </View>
        </SectionCard>

        {trip.fare != null ? (
          <SectionCard>
            <FareBreakdown trip={trip} />
          </SectionCard>
        ) : null}

        <SectionCard title={t('tripDetail.rating')}>
          {trip.rating ? <StarRating value={trip.rating} size={24} /> : <Text style={styles.hint}>{t('tripDetail.noRating')}</Text>}
        </SectionCard>
      </View>
    </ScrollView>
  );
}

function Fact({ label, value }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
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
  map: {
    height: 240,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  date: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: SPACING.md,
  },
  fact: {
    width: '50%',
  },
  factLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  factValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  hint: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
});
