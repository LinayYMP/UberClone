// AI-assisted: see docs/AI_LOG.md #1, #11
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { COLORS } from './src/constants/theme.js';
import { AuthProvider } from './src/context/AuthContext.js';
import { PreferencesProvider } from './src/context/PreferencesContext.js';
import RootNavigator from './src/navigation/RootNavigator.js';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.brand,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.textPrimary,
    border: COLORS.border,
    notification: COLORS.danger,
  },
};

// En la web, el título de la pestaña del navegador sigue a la pantalla actual.
const documentTitle = {
  formatter: (options) => (options?.title ? `${options.title} · UberClone Conductor` : 'UberClone Conductor'),
};

// Punto de entrada: gestos (para el Drawer) -> preferencias (idioma) -> sesión -> navegación.
export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <PreferencesProvider>
          <AuthProvider>
            <NavigationContainer theme={navigationTheme} documentTitle={documentTitle}>
              <RootNavigator />
            </NavigationContainer>
          </AuthProvider>
        </PreferencesProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
