// AI-assisted: see docs/AI_LOG.md #1
// Servidor simulado en memoria para la primera entrega. Reemplaza a Firebase (Authentication +
// Firestore) mientras se configura el backend real: los servicios ya exponen funciones async con la
// forma que tendrán entonces, así que las pantallas y contextos no cambiarán.
// Los datos viven en memoria: se conservan mientras la app está abierta y vuelven al estado
// inicial al recargarla (los datos personales no se guardan en AsyncStorage, por requisito).
import { SEED_DRIVERS } from './seedDrivers.js';

let latencyMs = 700;
let drivers = createStore();

function createStore() {
  return new Map(SEED_DRIVERS.map((driver) => [driver.id, clone(driver)]));
}

// Copia profunda: quien lee del "servidor" nunca recibe una referencia que pueda mutar.
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// Simula el tiempo de respuesta de la red para poder ver los estados de carga.
export function simulateLatency(ms = latencyMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function findDriverByEmail(email) {
  for (const driver of drivers.values()) {
    if (driver.email === email) {
      return clone(driver);
    }
  }
  return null;
}

export function findDriverById(id) {
  const driver = drivers.get(id);
  return driver ? clone(driver) : null;
}

export function updateDriver(id, changes) {
  const current = drivers.get(id);
  if (!current) {
    return null;
  }
  const updated = { ...current, ...clone(changes), updatedAt: new Date().toISOString() };
  drivers.set(id, updated);
  return clone(updated);
}

// Solo para pruebas automáticas: sin espera y con los datos iniciales.
export function resetMockServer({ latency = 700 } = {}) {
  latencyMs = latency;
  drivers = createStore();
}
