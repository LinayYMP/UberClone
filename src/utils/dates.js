// AI-assisted: see docs/AI_LOG.md #1, #11
// Las fechas sin hora (nacimiento, vencimientos) se guardan como texto 'AAAA-MM-DD' en hora local,
// así no se corren un día por la zona horaria al convertirlas a UTC.

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const pad = (value) => String(value).padStart(2, '0');

export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Devuelve un Date local o null si el texto no es una fecha real (por ejemplo 2024-02-30).
export function parseISODate(value) {
  if (typeof value !== 'string' || !ISO_DATE_PATTERN.test(value)) {
    return null;
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const isSameDate = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return isSameDate ? date : null;
}

// Años cumplidos a la fecha `today`.
export function calculateAge(birthDate, today = new Date()) {
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }
  return age;
}

// Última fecha de nacimiento posible para tener `years` años cumplidos hoy.
export function latestBirthDateForAge(years, today = new Date()) {
  const date = new Date(today.getFullYear() - years, today.getMonth(), today.getDate());
  // 29 de febrero en un año no bisiesto: JavaScript lo pasa al 1 de marzo; se usa el 28 de febrero.
  if (date.getMonth() !== today.getMonth()) {
    date.setDate(0);
  }
  return date;
}

// 'es' -> DD/MM/AAAA, 'en' -> MM/DD/YYYY
export function formatDisplayDate(isoDate, language) {
  const date = parseISODate(isoDate);
  if (!date) {
    return '';
  }
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  return language === 'en' ? `${month}/${day}/${year}` : `${day}/${month}/${year}`;
}

// Fecha y hora de un viaje: "10/11/2026 · 14:05" (24 horas).
export function formatDateTime(date, language) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '';
  }
  return `${formatDisplayDate(toISODate(date), language)} · ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
