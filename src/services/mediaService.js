// AI-assisted: see docs/AI_LOG.md #11
// Fotos de perfil, vehículo y documentos en Cloudinary (plan gratuito), como recomienda el documento:
// Firebase Storage puede exigir el plan de pago en proyectos nuevos. En Firestore solo se guarda la URL.
import { Platform } from 'react-native';

import { ERROR_CODES, ServiceError } from './serviceError.js';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// Sin Cloudinary configurado se guarda la ruta local: la foto solo se verá en este dispositivo.
export const isMediaUploadConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

const isRemote = (uri) => /^https?:\/\//.test(uri);

export async function uploadImage(uri, folder) {
  if (!uri || !isMediaUploadConfigured || isRemote(uri)) {
    return uri;
  }
  const form = new FormData();
  if (Platform.OS === 'web') {
    form.append('file', await (await fetch(uri)).blob());
  } else {
    form.append('file', { uri, name: 'foto.jpg', type: 'image/jpeg' });
  }
  form.append('upload_preset', UPLOAD_PRESET);
  form.append('folder', folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  });
  if (!response.ok) {
    throw new ServiceError(ERROR_CODES.UPLOAD_FAILED);
  }
  return (await response.json()).secure_url;
}

// Sube las fotos de los campos indicados y devuelve los valores con las URL finales.
export async function uploadPhotos(values, photoFields, folder) {
  const uploaded = { ...values };
  for (const field of photoFields) {
    uploaded[field] = await uploadImage(values[field], folder);
  }
  return uploaded;
}
