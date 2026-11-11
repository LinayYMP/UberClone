// AI-assisted: see docs/AI_LOG.md #1, #11
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import LogoutButton from '../components/LogoutButton.js';
import { COLORS, TYPOGRAPHY } from '../constants/theme.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { useRegistration } from '../context/RegistrationContext.js';
import DocumentsScreen from '../screens/registration/DocumentsScreen.js';
import PersonalDataScreen from '../screens/registration/PersonalDataScreen.js';
import VehicleScreen from '../screens/registration/VehicleScreen.js';

const Tab = createBottomTabNavigator();

// Registro del conductor con navegación Tab (como pide el documento): Datos personales, Vehículo y
// Documentos. Se muestra mientras la cuenta está "Registro incompleto".
const TABS = {
  PersonalData: { section: 'personalData', icons: ['person', 'person-outline'] },
  Vehicle: { section: 'vehicle', icons: ['car', 'car-outline'] },
  Documents: { section: 'documents', icons: ['document-text', 'document-text-outline'] },
};

export default function RegistrationNavigator() {
  const { t } = usePreferences();
  const { progress } = useRegistration();

  return (
    <>
      <StatusBar style="dark" />
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
        <Tab.Screen name="Documents" component={DocumentsScreen} options={{ title: t('registration.tabs.documents') }} />
      </Tab.Navigator>
    </>
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
});
