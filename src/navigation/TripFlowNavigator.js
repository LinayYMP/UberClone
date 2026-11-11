// AI-assisted: see docs/AI_LOG.md #11
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoadingView from '../components/LoadingView.js';
import { TRIP_STATUS } from '../constants/trips.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { useTrip } from '../context/TripContext.js';
import HomeScreen from '../screens/main/HomeScreen.js';
import TripChargeScreen from '../screens/trip/TripChargeScreen.js';
import TripScreen from '../screens/trip/TripScreen.js';

const Stack = createNativeStackNavigator();

const ON_THE_ROAD = [TRIP_STATUS.ACCEPTED, TRIP_STATUS.DRIVER_ARRIVING, TRIP_STATUS.IN_PROGRESS];

// Stack del flujo del viaje (como pide el documento). El campo `status` del viaje activo decide
// la pantalla: sin viaje -> Inicio; aceptado, yendo a recoger o en curso -> Viaje en curso;
// completado o pagado -> Cobro y resumen. El botón "atrás" no puede saltarse un paso.
export default function TripFlowNavigator() {
  const { t } = usePreferences();
  const { activeTrip, summaryTrip, isLoaded } = useTrip();

  if (!isLoaded) {
    return <LoadingView message={t('common.loading')} />;
  }

  let screen;
  if (summaryTrip) {
    screen = <Stack.Screen name="TripCharge" component={TripChargeScreen} />;
  } else if (activeTrip && ON_THE_ROAD.includes(activeTrip.status)) {
    screen = <Stack.Screen name="Trip" component={TripScreen} />;
  } else {
    screen = <Stack.Screen name="Home" component={HomeScreen} />;
  }

  return <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>{screen}</Stack.Navigator>;
}
