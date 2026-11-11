// AI-assisted: see docs/AI_LOG.md #11
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { COLORS, SPACING } from '../constants/theme.js';
import { usePreferences } from '../context/PreferencesContext.js';

// Calificación de 1 a 5. Sin `onChange` solo muestra el valor.
export default function StarRating({ value = 0, onChange, size = 32 }) {
  const { t } = usePreferences();
  return (
    <View style={styles.row} accessibilityRole={onChange ? 'adjustable' : 'text'} accessibilityValue={{ min: 0, max: 5, now: value }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const icon = <Ionicons name={star <= value ? 'star' : 'star-outline'} size={size} color={star <= value ? COLORS.star : COLORS.borderStrong} />;
        if (!onChange) {
          return <View key={star}>{icon}</View>;
        }
        return (
          <Pressable key={star} onPress={() => onChange(star)} hitSlop={6} accessibilityRole="button" accessibilityLabel={t('charge.star', { count: star })}>
            {icon}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
});
