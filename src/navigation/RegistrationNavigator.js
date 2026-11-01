// AI-assisted: see docs/AI_LOG.md #1
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import AppButton from '../components/AppButton.js';
import ErrorView from '../components/ErrorView.js';
import LoadingView from '../components/LoadingView.js';
import LogoutButton from '../components/LogoutButton.js';
import { COLORS, TYPOGRAPHY } from '../constants/theme.js';
import { useAuth } from '../context/AuthContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { LOAD_STATUS, RegistrationProvider, useRegistration } from '../context/RegistrationContext.js';
import PersonalDataScreen from '../screens/registration/PersonalDataScreen.js';
import VehicleScreen from '../screens/registration/VehicleScreen.js';

const Tab = createBottomTabNavigator();

// Pestañas del registro (navegación Tab, como pide el documento). La pestaña 3 — Documentos —
// se agrega aquí en la siguiente entrega.
const TABS = {
  PersonalData: { section: 'personalData', icons: ['person', 'person-outline'] },
  Vehicle: { section: 'vehicle', icons: ['car', 'car-outline'] },
};

export default function RegistrationNavigator() {
  return (
    <RegistrationProvider>
      <StatusBar style="dark" />
      <RegistrationTabs />
    </RegistrationProvider>
  );
}

function RegistrationTabs() {
  const { t } = usePreferences();
  const { signOut } = useAuth();
  const { loadStatus, reload, progress } = useRegistration();

  if (loadStatus === LOAD_STATUS.LOADING) {
    return <LoadingView message={t('registration.loading')} />;
  }

  if (loadStatus === LOAD_STATUS.ERROR) {
    return (
      <ErrorView message={t('registration.loadError')} retryLabel={t('common.retry')} onRetry={reload}>
        <AppButton title={t('session.logout')} variant="secondary" onPress={signOut} style={styles.fullWidth} />
      </ErrorView>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerTitleAlign: 'left',
        headerTitleStyle: styles.headerTitle,
        headerStyle: styles.header,
        headerShadowVisible: false,
        headerRight: () => <LogoutButton />,
        tabBarActiveTintColor: COLORS.brand,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarHideOnKeyboard: true,
        tabBarIcon: ({ focused, color, size }) => {
          const { section, icons } = TABS[route.name];
          return <TabIcon name={focused ? icons[0] : icons[1]} color={color} size={size} isComplete={progress[section]} />;
        },
      })}
    >
      <Tab.Screen name="PersonalData" component={PersonalDataScreen} options={{ title: t('registration.tabs.personalData') }} />
      <Tab.Screen name="Vehicle" component={VehicleScreen} options={{ title: t('registration.tabs.vehicle') }} />
    </Tab.Navigator>
  );
}

// Icono de la pestaña con una marca verde cuando esa sección ya está completa.
function TabIcon({ name, color, size, isComplete }) {
  return (
    <View>
      <Ionicons name={name} size={size} color={color} />
      {isComplete ? (
        <View style={styles.completeBadge}>
          <Ionicons name="checkmark" size={10} color={COLORS.textOnBrand} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textPrimary,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  completeBadge: {
    position: 'absolute',
    top: -3,
    right: -7,
    width: 15,
    height: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
});
