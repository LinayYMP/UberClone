// AI-assisted: see docs/AI_LOG.md #1, #11
// Reglas y opciones del registro del conductor (sección 2 del documento del proyecto).
// Los validadores y los campos (maxLength, teclado) leen de aquí para no repetir números.

// Estado de la cuenta: al enviar el registro queda "pendiente de aprobación" y solo con
// "aprobado" el conductor puede ponerse Disponible.
export const ACCOUNT_STATUS = {
  INCOMPLETE: 'incomplete',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
};

// Las tres pestañas del registro.
export const REGISTRATION_SECTIONS = ['personalData', 'vehicle', 'documents'];

// Pestaña 3 — Documentos y pagos
export const DOCUMENT_RULES = {
  // El documento no fija el formato del número de licencia: letras y números, de 5 a 20 caracteres.
  licenseMinLength: 5,
  licenseMaxLength: 20,
  // En Colombia los carros particulares nuevos hacen la primera revisión técnico-mecánica al
  // quinto año de matrícula; antes no aplica. Se aproxima con el año del modelo.
  technicalInspectionAfterYears: 5,
};

// Cuenta: mínimo que exige Firebase Authentication para la contraseña.
export const ACCOUNT_RULES = {
  passwordMinLength: 6,
};

// Pestaña 1 — Datos personales
export const PERSONAL_RULES = {
  fullNameMaxLength: 50,
  documentMinDigits: 6,
  documentMaxDigits: 10,
  phoneDigits: 10,
  minimumAge: 18,
};

export const GENDERS = ['female', 'male', 'other', 'undisclosed'];

// Pestaña 2 — Vehículo
export const VEHICLE_RULES = {
  plateLength: 6,
  brandMaxLength: 30,
  modelMaxLength: 30,
  yearDigits: 4,
  capacityMaxDigits: 2,
};

// Mismas categorías que elige el pasajero. minCapacity: XL exige mínimo 6 pasajeros.
export const VEHICLE_CATEGORIES = [
  { id: 'economy', minCapacity: 1 },
  { id: 'xl', minCapacity: 6 },
  { id: 'premium', minCapacity: 1 },
];

export const VEHICLE_COLORS = [
  { id: 'white', swatch: '#FFFFFF' },
  { id: 'black', swatch: '#111111' },
  { id: 'gray', swatch: '#8A8A8A' },
  { id: 'silver', swatch: '#C8CCD0' },
  { id: 'red', swatch: '#C62828' },
  { id: 'blue', swatch: '#1E4FA8' },
  { id: 'green', swatch: '#2E7D32' },
  { id: 'yellow', swatch: '#F2C200' },
  { id: 'beige', swatch: '#D9C7A3' },
  { id: 'brown', swatch: '#6D4C41' },
  { id: 'orange', swatch: '#EF6C00' },
];
