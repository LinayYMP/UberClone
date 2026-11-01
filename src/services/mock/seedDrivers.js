// AI-assisted: see docs/AI_LOG.md #1
// Cuentas de PRUEBA del servidor simulado (no son datos reales). Las contraseñas solo existen
// aquí porque es un mock: con Firebase Authentication nunca llegan a la app ni a la base de datos.
import { ACCOUNT_STATUS } from '../../constants/registration.js';

export const SEED_DRIVERS = [
  {
    id: 'drv_001',
    email: 'conductor@uberclone.test',
    password: 'Conductor123',
    accountStatus: ACCOUNT_STATUS.INCOMPLETE,
    personalData: null,
    vehicle: null,
    documents: null,
  },
];
