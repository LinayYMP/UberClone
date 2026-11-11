// AI-assisted: see docs/AI_LOG.md #1, #11
import { Platform } from 'react-native';

// Paleta inspirada en la app de conductor: negro de marca, superficies blancas
// y colores de estado reservados para mensajes (éxito, error, aviso, información).
export const COLORS = {
  brand: '#000000',
  brandSoft: '#1F1F1F',
  background: '#F6F6F6',
  surface: '#FFFFFF',
  surfaceMuted: '#F3F3F3',
  textPrimary: '#141414',
  textSecondary: '#5E5E5E',
  textMuted: '#8A8A8A',
  textOnBrand: '#FFFFFF',
  textOnBrandMuted: '#B8B8B8',
  // Elementos sobre fondo negro (tarjeta de avance del registro, encabezado del login).
  onBrandBorder: '#3A3A3A',
  onBrandTrackActive: '#8C8C8C',
  onBrandSuccess: '#3DDC84',
  onBrandWarning: '#FFC043',
  onBrandInfo: '#6EA0FF',
  onBrandDanger: '#FF8A80',
  imageOverlay: 'rgba(0, 0, 0, 0.35)',
  imageBadge: 'rgba(0, 0, 0, 0.75)',
  border: '#E2E2E2',
  borderStrong: '#C9C9C9',
  focus: '#276EF1',
  info: '#276EF1',
  infoSoft: '#EEF3FE',
  success: '#05944F',
  successSoft: '#E6F4EC',
  warning: '#9A5B00',
  warningSoft: '#FFF4DB',
  danger: '#D32F2F',
  dangerSoft: '#FDECEC',
  backdrop: 'rgba(0, 0, 0, 0.45)',
  star: '#F5A623',
};

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const TYPOGRAPHY = {
  display: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.2 },
  subtitle: { fontSize: 17, fontWeight: '700' },
  body: { fontSize: 15, fontWeight: '400' },
  label: { fontSize: 14, fontWeight: '600' },
  caption: { fontSize: 13, fontWeight: '400' },
  overline: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
};

// Altura mínima de toque recomendada (44 pt en iOS, 48 dp en Android).
export const TOUCH_TARGET = 48;

// En tablets y en la web los formularios no se estiran sin límite.
export const MAX_CONTENT_WIDTH = 560;

// iOS usa shadow*, Android usa elevation y la web usa boxShadow.
export const SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  android: { elevation: 2 },
  default: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.06)' },
});
