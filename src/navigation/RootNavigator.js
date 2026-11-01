// AI-assisted: see docs/AI_LOG.md #1
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoadingView from '../components/LoadingView.js';
import { AUTH_STATUS, useAuth } from '../context/AuthContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import LoginScreen from '../screens/auth/LoginScreen.js';
import RegistrationNavigator from './RegistrationNavigator.js';

const Stack = createNativeStackNavigator();

// Navegación según el resultado de la autenticación: sin sesión solo existe Login; con sesión,
// el módulo del conductor. Al cambiar la sesión React Navigation cambia de pantalla solo,
// y el botón "atrás" no puede volver al login (ni del login a una sesión cerrada).
export default function RootNavigator() {
  const { t, isReady } = usePreferences();
  const { status } = useAuth();

  if (!isReady || status === AUTH_STATUS.RESTORING) {
    return <LoadingView message={t('session.restoring')} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {status === AUTH_STATUS.SIGNED_IN ? (
        <Stack.Screen name="DriverRegistration" component={RegistrationNavigator} />
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: t('login.title'), animationTypeForReplace: 'pop' }}
        />
      )}
    </Stack.Navigator>
  );
}
