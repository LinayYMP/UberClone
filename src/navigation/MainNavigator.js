// AI-assisted: see docs/AI_LOG.md #11
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { useRegistration } from '../context/RegistrationContext.js';
import { TripProvider } from '../context/TripContext.js';
import { savePushToken } from '../services/driverService';
import { registerForPushNotifications } from '../services/notificationService';
import DocumentsScreen from '../screens/registration/DocumentsScreen.js';
import PersonalDataScreen from '../screens/registration/PersonalDataScreen.js';
import VehicleScreen from '../screens/registration/VehicleScreen.js';
import EarningsScreen from '../screens/main/EarningsScreen.js';
import HistoryScreen from '../screens/main/HistoryScreen.js';
import ProfileScreen from '../screens/main/ProfileScreen.js';
import TripDetailScreen from '../screens/main/TripDetailScreen.js';
import TripFlowNavigator from './TripFlowNavigator.js';

const Drawer = createDrawerNavigator();
const HistoryStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const DRAWER_ICONS = {
  Inicio: 'map-outline',
  Ganancias: 'wallet-outline',
  Historial: 'time-outline',
  Perfil: 'person-circle-outline',
};

// Drawer para inicio, ganancias, historial y perfil y configuración (como pide el documento).
// El viaje activo (TripProvider) envuelve todo para que el flujo del viaje no se pierda al cambiar de sección.
export default function MainNavigator() {
  const { t } = usePreferences();
  const { driverId } = useRegistration();

  // Token de Firebase Cloud Messaging para recibir solicitudes con la app en segundo plano.
  useEffect(() => {
    registerForPushNotifications()
      .then((token) => token && savePushToken(driverId, token))
      .catch(() => undefined);
  }, [driverId]);

  return (
    <TripProvider>
      <Drawer.Navigator
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={({ route }) => ({
          headerTitleStyle: styles.headerTitle,
          headerShadowVisible: false,
          headerTintColor: COLORS.textPrimary,
          drawerActiveTintColor: COLORS.textOnBrand,
          drawerActiveBackgroundColor: COLORS.brand,
          drawerInactiveTintColor: COLORS.textPrimary,
          drawerLabelStyle: styles.drawerLabel,
          drawerIcon: ({ color, size }) => <Ionicons name={DRAWER_ICONS[route.name]} size={size} color={color} />,
        })}
      >
        <Drawer.Screen name="Inicio" component={TripFlowNavigator} options={{ title: t('drawer.home'), headerShown: false }} />
        <Drawer.Screen name="Ganancias" component={EarningsScreen} options={{ title: t('drawer.earnings') }} />
        <Drawer.Screen name="Historial" component={HistoryNavigator} options={{ title: t('drawer.history'), headerShown: false }} />
        <Drawer.Screen name="Perfil" component={ProfileNavigator} options={{ title: t('drawer.profile'), headerShown: false }} />
      </Drawer.Navigator>
    </TripProvider>
  );
}

function HistoryNavigator({ navigation }) {
  const { t } = usePreferences();
  return (
    <HistoryStack.Navigator screenOptions={stackOptions}>
      <HistoryStack.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: t('history.title'), headerLeft: () => <MenuButton navigation={navigation} label={t('home.menu')} /> }}
      />
      <HistoryStack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: t('tripDetail.title') }} />
    </HistoryStack.Navigator>
  );
}

function ProfileNavigator({ navigation }) {
  const { t } = usePreferences();
  return (
    <ProfileStack.Navigator screenOptions={stackOptions}>
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('profile.title'), headerLeft: () => <MenuButton navigation={navigation} label={t('home.menu')} /> }}
      />
      <ProfileStack.Screen name="EditPersonalData" component={PersonalDataScreen} options={{ title: t('profile.personalData') }} />
      <ProfileStack.Screen name="EditVehicle" component={VehicleScreen} options={{ title: t('profile.vehicle') }} />
      <ProfileStack.Screen name="EditDocuments" component={DocumentsScreen} options={{ title: t('profile.documents') }} />
    </ProfileStack.Navigator>
  );
}

function MenuButton({ navigation, label }) {
  return (
    <Ionicons
      name="menu"
      size={26}
      color={COLORS.textPrimary}
      onPress={() => navigation.openDrawer()}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.menuButton}
    />
  );
}

// Encabezado del menú lateral con la foto, el nombre y el estado de la cuenta.
function DrawerContent(props) {
  const { t } = usePreferences();
  const { registration } = useRegistration();
  const { personalData } = registration;

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
      <View style={styles.drawerHeader}>
        {personalData?.photoUri ? (
          <Image source={{ uri: personalData.photoUri }} style={styles.drawerAvatar} />
        ) : (
          <View style={[styles.drawerAvatar, styles.drawerAvatarPlaceholder]}>
            <Ionicons name="person" size={28} color={COLORS.textMuted} />
          </View>
        )}
        <Text style={styles.drawerName}>{personalData?.fullName ?? registration.email}</Text>
        <Text style={styles.drawerStatus}>{t(`registration.accountStatus.${registration.accountStatus}`)}</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const stackOptions = {
  headerTitleStyle: { ...TYPOGRAPHY.subtitle, color: COLORS.textPrimary },
  headerShadowVisible: false,
  headerTintColor: COLORS.textPrimary,
};

const styles = StyleSheet.create({
  headerTitle: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textPrimary,
  },
  drawerLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  menuButton: {
    marginRight: SPACING.lg,
  },
  drawerContent: {
    paddingTop: 0,
  },
  drawerHeader: {
    padding: SPACING.xl,
    paddingTop: SPACING.xxl + SPACING.lg,
    gap: SPACING.xs,
    backgroundColor: COLORS.brand,
    marginBottom: SPACING.md,
  },
  drawerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: SPACING.sm,
  },
  drawerAvatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceMuted,
  },
  drawerName: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.textOnBrand,
  },
  drawerStatus: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textOnBrandMuted,
  },
});
