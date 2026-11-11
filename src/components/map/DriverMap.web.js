// AI-assisted: see docs/AI_LOG.md #11
import { StyleSheet, View } from 'react-native';

import { COLORS } from '../../constants/theme.js';
import { regionForPoints } from '../../utils/geo.js';

// react-native-maps no funciona en la web: aquí se muestra el mapa de OpenStreetMap del área con
// un marcador en el conductor (o en el primer punto). La ruta se dibuja solo en Android/iOS.
export default function DriverMap({ driverLocation, markers = [], route = null, style }) {
  const points = [driverLocation, ...markers.map((marker) => marker.point), ...(route ?? [])].filter(Boolean);
  const region = regionForPoints(points.length ? points : [{ lat: 6.2442, lng: -75.5812 }]);
  const focus = driverLocation ?? markers[0]?.point ?? { lat: region.latitude, lng: region.longitude };
  const bbox = [
    region.longitude - region.longitudeDelta,
    region.latitude - region.latitudeDelta,
    region.longitude + region.longitudeDelta,
    region.latitude + region.latitudeDelta,
  ].join(',');
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${focus.lat},${focus.lng}`;

  return (
    <View style={[StyleSheet.absoluteFill, styles.container, style]}>
      <iframe title="mapa" src={src} style={iframeStyle} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceMuted,
  },
});

const iframeStyle = { width: '100%', height: '100%', border: 'none' };
