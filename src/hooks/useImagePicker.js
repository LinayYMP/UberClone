// AI-assisted: see docs/AI_LOG.md #1
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';

export const PHOTO_SOURCES = {
  CAMERA: 'camera',
  GALLERY: 'gallery',
};

// Abre la cámara o la galería y devuelve { uri }, { canceled: true } o { error: claveDeTraduccion }.
// La galería no necesita permiso (selector del sistema); la cámara sí.
// `aspect` debe ser un arreglo constante declarado fuera del componente.
export default function useImagePicker(aspect) {
  const [isPicking, setIsPicking] = useState(false);

  const pickImage = useCallback(
    async (source) => {
      setIsPicking(true);
      try {
        if (source === PHOTO_SOURCES.CAMERA) {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) {
            return { error: 'photo.cameraPermissionDenied' };
          }
        }

        const options = { mediaTypes: ['images'], allowsEditing: true, aspect, quality: 0.7 };
        const result =
          source === PHOTO_SOURCES.CAMERA
            ? await ImagePicker.launchCameraAsync(options)
            : await ImagePicker.launchImageLibraryAsync(options);

        if (result.canceled || !result.assets?.length) {
          return { canceled: true };
        }
        return { uri: result.assets[0].uri };
      } catch {
        return { error: 'photo.pickerError' };
      } finally {
        setIsPicking(false);
      }
    },
    [aspect],
  );

  return { pickImage, isPicking };
}
