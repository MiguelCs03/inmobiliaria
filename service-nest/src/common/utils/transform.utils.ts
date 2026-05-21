import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

const BO_TZ = 'America/La_Paz';

/**
 * Lee un valor (string|Date) y:
 * - registra su representación en UTC y en hora de Bolivia
 * - devuelve el mismo instante (Date en UTC) para evitar desplazamientos
 */
export function transformToBOTime(value: any): string | null {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  return `${formatInTimeZone(date, BO_TZ, "yyyy-MM-dd'T'HH:mm:ss.SSS")}Z`;
}

/**
 * Si recibes una hora "de Bolivia" (hora local) y necesitas guardarla en UTC.
 * Ej.: '2026-01-26T16:15:08.151' (hora local BO) -> Date en UTC
 */
export function fromBOToUtc(value: string | Date): Date {
  const d = value instanceof Date ? value : new Date(value);
  return toZonedTime(d, BO_TZ);
}

/**
 * Si quieres mostrar un Date/UTC como string en la zona de Bolivia.
 */
export function formatUtcInBO(value: string | Date, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"): string {
  const d = value instanceof Date ? value : new Date(value);
  return formatInTimeZone(d, BO_TZ, pattern);
}
