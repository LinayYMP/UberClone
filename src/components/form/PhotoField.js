// AI-assisted: see docs/AI_LOG.md #1
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS, RADIUS, SPACING } from '../../constants/theme.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import useImagePicker, { PHOTO_SOURCES } from '../../hooks/useImagePicker.js';
import BottomSheet from '../BottomSheet.js';
import ListOption from '../ListOption.js';
import FormField from './FormField.js';

// Recorte sugerido al elegir la foto: cuadrado para el perfil, 4:3 para el vehículo.
const ASPECTS = {
  avatar: [1, 1],
  banner: [4, 3],
};

// Foto obligatoria desde cámara o galería. variant="avatar" (perfil) o "banner" (vehículo).
// Los errores de permisos se muestran debajo del campo, igual que los de validación.
export default function PhotoField({ label, accessibilityLabel, value, onChange, onBlur, error, hint, variant = 'avatar' }) {
  const { t } = usePreferences();
  const { pickImage, isPicking } = useImagePicker(ASPECTS[variant]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [pickerError, setPickerError] = useState(null);
  // En iOS no se puede abrir la cámara mientras la hoja se está cerrando: se espera a onDismiss.
  const pendingSource = useRef(null);

  const launchPicker = async (source) => {
    const result = await pickImage(source);
    if (result.uri) {
      onChange(result.uri);
    } else if (result.error) {
      setPickerError({ key: result.error });
      onBlur?.();
    } else {
      onBlur?.();
    }
  };

  const handleChooseSource = (source) => {
    setPickerError(null);
    setIsSheetOpen(false);
    if (Platform.OS === 'ios') {
      pendingSource.current = source;
    } else {
      launchPicker(source);
    }
  };

  const handleSheetDismissed = () => {
    const source = pendingSource.current;
    pendingSource.current = null;
    if (source) {
      launchPicker(source);
    }
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    onBlur?.();
  };

  const actionLabel = value ? t('photo.change') : t('photo.add');
  const shownError = pickerError ?? error;
  const isAvatar = variant === 'avatar';

  return (
    <FormField label={label} error={shownError} hint={hint} style={isAvatar && styles.avatarField}>
      <Pressable
        onPress={() => setIsSheetOpen(true)}
        disabled={isPicking}
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel ?? label}. ${actionLabel}`}
        style={({ pressed }) => [isAvatar ? styles.avatarContainer : styles.bannerContainer, pressed && styles.pressed]}
      >
        {/* El marco recorta la imagen; la insignia de cámara va fuera de él para no quedar cortada. */}
        <View style={[isAvatar ? styles.avatarFrame : styles.bannerFrame, shownError && styles.invalid]}>
          {value ? (
            <Image source={{ uri: value }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name={isAvatar ? 'person' : 'car-sport-outline'} size={isAvatar ? 52 : 44} color={COLORS.textMuted} />
              {!isAvatar ? <Text style={styles.placeholderText}>{actionLabel}</Text> : null}
            </View>
          )}
          {isPicking ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={COLORS.textOnBrand} />
            </View>
          ) : null}
        </View>
        <View style={isAvatar ? styles.avatarBadge : styles.bannerBadge}>
          <Ionicons name="camera" size={16} color={COLORS.textOnBrand} />
          {!isAvatar && value ? <Text style={styles.badgeText}>{actionLabel}</Text> : null}
        </View>
      </Pressable>
      {isAvatar ? <Text style={styles.avatarAction}>{actionLabel}</Text> : null}

      <BottomSheet
        visible={isSheetOpen}
        onClose={handleCloseSheet}
        onDismiss={handleSheetDismissed}
        title={t('photo.sheetTitle')}
      >
        <ListOption icon="camera-outline" label={t('photo.takePhoto')} onPress={() => handleChooseSource(PHOTO_SOURCES.CAMERA)} />
        <ListOption
          icon="images-outline"
          label={t('photo.chooseFromGallery')}
          onPress={() => handleChooseSource(PHOTO_SOURCES.GALLERY)}
        />
      </BottomSheet>
    </FormField>
  );
}

const AVATAR_SIZE = 116;

const styles = StyleSheet.create({
  avatarField: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
  avatarFrame: {
    flex: 1,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 2,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  bannerContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    maxHeight: 260,
  },
  bannerFrame: {
    flex: 1,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.borderStrong,
    overflow: 'hidden',
  },
  invalid: {
    borderColor: COLORS.danger,
  },
  pressed: {
    opacity: 0.85,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  placeholderText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.imageOverlay,
  },
  avatarBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.brand,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  bannerBadge: {
    position: 'absolute',
    right: SPACING.sm,
    bottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.imageBadge,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textOnBrand,
  },
  avatarAction: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});
