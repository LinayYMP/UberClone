// AI-assisted: see docs/AI_LOG.md #11
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { COLORS } from '../../constants/theme.js';
import { regionForPoints, toLatLng } from '../../utils/geo.js';

const MARKER_STYLES = {
  pickup: { icon: 'person', color: COLORS.success },
  destination: { icon: 'flag', color: COLORS.brand },
};

// Mapa del conductor con react-native-maps (Maps SDK de Android/iOS, sin costo por uso).
// La versión web está en DriverMap.web.js. La ruta guardada se dibuja con Polyline, sin pedirla
// otra vez a ningún servicio (recomendación del documento).
// Props: driverLocation { lat, lng }, markers [{ id, point, kind }], route [{ lat, lng }]
export default function DriverMap({ driverLocation, markers = [], route = null, style, edgePadding }) {
  const mapRef = useRef(null);
  const points = useMemo(
    () => [driverLocation, ...markers.map((marker) => marker.point), ...(route ?? [])].filter(Boolean),
    [driverLocation, markers, route],
  );
  const initialRegion = useMemo(() => regionForPoints(points.length ? points : [{ lat: 6.2442, lng: -75.5812 }]), []); // eslint-disable-line react-hooks/exhaustive-deps

  // Encuadra el mapa cuando cambian la ruta o los marcadores (no en cada movimiento del conductor).
  const fitKey = `${markers.map((marker) => marker.id).join(',')}|${route?.length ?? 0}|${driverLocation ? 1 : 0}`;
  useEffect(() => {
    if (points.length === 0 || !mapRef.current) {
      return;
    }
    if (points.length === 1) {
      mapRef.current.animateToRegion({ ...toLatLng(points[0]), latitudeDelta: 0.012, longitudeDelta: 0.012 }, 400);
      return;
    }
    mapRef.current.fitToCoordinates(points.map(toLatLng), {
      edgePadding: edgePadding ?? { top: 80, right: 60, bottom: 320, left: 60 },
      animated: true,
    });
  }, [fitKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <MapView ref={mapRef} style={[StyleSheet.absoluteFill, style]} initialRegion={initialRegion} showsCompass={false} toolbarEnabled={false}>
      {route?.length > 1 ? <Polyline coordinates={route.map(toLatLng)} strokeColor={COLORS.brand} strokeWidth={5} /> : null}
      {markers.map((marker) => {
        const look = MARKER_STYLES[marker.kind] ?? MARKER_STYLES.destination;
        return (
          <Marker key={marker.id} coordinate={toLatLng(marker.point)} tracksViewChanges={false}>
            <View style={[styles.pin, { backgroundColor: look.color }]}>
              <Ionicons name={look.icon} size={16} color={COLORS.textOnBrand} />
            </View>
          </Marker>
        );
      })}
      {driverLocation ? (
        <Marker coordinate={toLatLng(driverLocation)} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <View style={styles.driver}>
            <Ionicons name="car-sport" size={16} color={COLORS.textOnBrand} />
          </View>
        </Marker>
      ) : null}
    </MapView>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  driver: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.info,
    borderWidth: 3,
    borderColor: COLORS.surface,
  },
});
