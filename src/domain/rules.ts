import type { Booking, CreateBookingDto } from './booking';
import {
  WORK_DAY_START,
  WORK_DAY_END,
  MIN_DURATION_MINUTES,
  MAX_DURATION_MINUTES,
  timeToMinutes,
  formatDateIso,
} from './time';

export type ValidationErrorCode = 'CONFLICT' | 'VALIDATION_ERROR' | 'PAST_TIME';

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  code?: ValidationErrorCode;
  conflictingBookings?: Booking[];
};

/**
 * Правило 1: Время начала и окончания — в пределах рабочего дня (09:00–18:00).
 */
export function isWithinWorkDay(start: string, end: string): boolean {
  const startMins = timeToMinutes(start);
  const endMins = timeToMinutes(end);
  const workStartMins = timeToMinutes(WORK_DAY_START);
  const workEndMins = timeToMinutes(WORK_DAY_END);

  return startMins >= workStartMins && endMins <= workEndMins;
}

/**
 * Правило 2: Время начала строго меньше времени окончания (start < end).
 */
export function isStartBeforeEnd(start: string, end: string): boolean {
  return timeToMinutes(start) < timeToMinutes(end);
}

/**
 * Возвращает длительность бронирования в минутах.
 */
export function getDurationMinutes(start: string, end: string): number {
  return timeToMinutes(end) - timeToMinutes(start);
}

/**
 * Правила 3 и 4: Минимальная длительность — 30 минут, максимальная — 2 часа (120 минут).
 */
export function isValidDuration(start: string, end: string): boolean {
  if (!isStartBeforeEnd(start, end)) {
    return false;
  }
  const duration = getDurationMinutes(start, end);
  return duration >= MIN_DURATION_MINUTES && duration <= MAX_DURATION_MINUTES;
}

/**
 * Правило 5: Бронирования не могут пересекаться.
 * Касание границ (например, 10:00–11:00 и 11:00–12:00) конфликтом НЕ считается.
 * Формула: a.start < b.end && b.start < a.end
 */
export function hasOverlap(
  a: { start: string; end: string },
  b: { start: string; end: string }
): boolean {
  const aStart = timeToMinutes(a.start);
  const aEnd = timeToMinutes(a.end);
  const bStart = timeToMinutes(b.start);
  const bEnd = timeToMinutes(b.end);

  return aStart < bEnd && bStart < aEnd;
}

/**
 * Правило 6: Нельзя бронировать прошедшее время.
 * - Для прошедших дат создание брони недоступно.
 * - Для сегодняшней даты прошедшие слоты недоступны (по времени начала).
 * Передача `now` делает функцию чистой и детерминированной в тестах.
 */
export function isPastBooking(
  date: string,
  startTime: string,
  now: Date = new Date()
): boolean {
  const todayStr = formatDateIso(now);

  if (date < todayStr) {
    return true;
  }

  if (date === todayStr) {
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const startMins = timeToMinutes(startTime);
    return startMins < currentMins;
  }

  return false;
}

/**
 * Правило 7: При редактировании текущая бронь не должна конфликтовать сама с собой.
 * Возвращает список всех конфликтующих бронирований, исключая указанный ID.
 */
export function findConflictingBookings(
  candidate: { date: string; start: string; end: string; id?: string },
  existingBookings: Booking[],
  excludeBookingId?: string
): Booking[] {
  const ignoreId = excludeBookingId ?? candidate.id;

  return existingBookings.filter((existing) => {
    // Проверяем только бронирования на ту же самую дату
    if (existing.date !== candidate.date) {
      return false;
    }
    // Исключаем саму себя при редактировании
    if (ignoreId && existing.id === ignoreId) {
      return false;
    }
    return hasOverlap(candidate, existing);
  });
}

/**
 * Комплексная валидация бронирования с возвратом понятных сообщений об ошибках.
 */
export function validateBooking(
  candidate: CreateBookingDto & { id?: string },
  existingBookings: Booking[] = [],
  options?: {
    excludeBookingId?: string;
    now?: Date;
  }
): ValidationResult {
  const errors: string[] = [];

  // 1. Порядок времени
  if (!isStartBeforeEnd(candidate.start, candidate.end)) {
    return {
      isValid: false,
      errors: ['Время окончания должно быть позже времени начала.'],
      code: 'VALIDATION_ERROR',
    };
  }

  // 2. Границы рабочего дня
  if (!isWithinWorkDay(candidate.start, candidate.end)) {
    errors.push(`Бронирование должно быть в пределах рабочего дня (${WORK_DAY_START}–${WORK_DAY_END}).`);
  }

  // 3. Длительность
  const duration = getDurationMinutes(candidate.start, candidate.end);
  if (duration < MIN_DURATION_MINUTES) {
    errors.push(`Минимальная длительность бронирования — ${MIN_DURATION_MINUTES} минут.`);
  } else if (duration > MAX_DURATION_MINUTES) {
    errors.push(`Максимальная длительность бронирования — ${MAX_DURATION_MINUTES / 60} часа.`);
  }

  // 4. Прошедшее время
  if (isPastBooking(candidate.date, candidate.start, options?.now)) {
    errors.push('Нельзя создавать или переносить бронирование на прошедшее время.');
    return {
      isValid: false,
      errors,
      code: 'PAST_TIME',
    };
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      code: 'VALIDATION_ERROR',
    };
  }

  // 5. Конфликты пересечений
  const conflicts = findConflictingBookings(
    candidate,
    existingBookings,
    options?.excludeBookingId ?? candidate.id
  );

  if (conflicts.length > 0) {
    return {
      isValid: false,
      errors: ['Выбранное время пересекается с существующим бронированием.'],
      code: 'CONFLICT',
      conflictingBookings: conflicts,
    };
  }

  return {
    isValid: true,
    errors: [],
  };
}
