// AI-assisted: see docs/AI_LOG.md #1, #11
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AppButton from '../components/AppButton.js';
import ErrorView from '../components/ErrorView.js';
import LoadingView from '../components/LoadingView.js';
import { ACCOUNT_STATUS } from '../constants/registration.js';
import { AUTH_STATUS, useAuth } from '../context/AuthContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { LOAD_STATUS, RegistrationProvider, useRegistration } from '../context/RegistrationContext.js';
import LoginScreen from '../screens/auth/LoginScreen.js';
import SignUpScreen from '../screens/auth/SignUpScreen.js';
import MainNavigator from './MainNavigator.js';
import RegistrationNavigator from './RegistrationNavigator.js';

const Stack = createNativeStackNavigator();

// Navegación según el resultado de la autenticación: sin sesión, Login y Crear cuenta; con sesión,
// el módulo del conductor. Al cambiar la sesión React Navigation cambia de pantalla solo, y el
// botón "atrás" no puede volver al login (ni del login a una sesión cerrada).
export default function RootNavigator() {
  const { t, isReady } = usePreferences();
  const { status } = useAuth();

  if (!isReady || status === AUTH_STATUS.RESTORING) {
    return <LoadingView message={t('session.restoring')} />;
  }

  if (status === AUTH_STATUS.SIGNED_IN) {
    return (
      <RegistrationProvider>
        <SignedInNavigator />
      </RegistrationProvider>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: t('login.title'), animationTypeForReplace: 'pop' }} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: t('signUp.title') }} />
    </Stack.Navigator>
  );
}

// Con sesión: mientras el registro está incompleto se ven las pestañas del registro; al enviarlo
// (pendiente de aprobación o aprobado) se ve la app del conductor con el Drawer.
function SignedInNavigator() {
  const { t } = usePreferences();
  const { signOut } = useAuth();
  const { registration, loadStatus, reload } = useRegistration();

  if (loadStatus === LOAD_STATUS.LOADING) {
    return <LoadingView message={t('registration.loading')} />;
  }
  if (loadStatus === LOAD_STATUS.ERROR) {
    return (
      <ErrorView message={t('registration.loadError')} retryLabel={t('common.retry')} onRetry={reload}>
        <AppButton title={t('session.logout')} variant="secondary" onPress={signOut} />
      </ErrorView>
    );
  }

  const isRegistering = registration.accountStatus === ACCOUNT_STATUS.INCOMPLETE;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isRegistering ? (
        <Stack.Screen name="DriverRegistration" component={RegistrationNavigator} options={{ title: t('registration.progressTitle') }} />
      ) : (
        <Stack.Screen name="DriverApp" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}
