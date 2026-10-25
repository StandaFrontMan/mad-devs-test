export const WORK_DAY_START = '09:00';
export const WORK_DAY_END = '18:00';
export const SLOT_STEP_MINUTES = 30;
export const MIN_DURATION_MINUTES = 30;
export const MAX_DURATION_MINUTES = 120;

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

// проверка строчки на формат hh mm
export function isValidTimeFormat(time: string): boolean {
  return TIME_REGEX.test(time);
}

// перевод времени из строки hh mm в минуты от полуночи
export function timeToMinutes(time: string): number {
  if (!isValidTimeFormat(time)) {
    throw new Error(`Некорректный формат времени: "${time}". Ожидается HH:mm.`);
  }
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// перевод минут от полуночи в строчку формата hh mm 
export function minutesToTime(minutes: number): string {
  if (minutes < 0 || minutes >= 24 * 60) {
    throw new Error(`Минуты должны быть в диапазоне от 0 до 1439, получено: ${minutes}`);
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Генерирует массив временных меток с заданным шагом.
 * По умолчанию от "09:00" до "18:00" с шагом 30 минут:
 * ["09:00", "09:30", "10:00", ..., "17:30", "18:00"]
 */
export function generateTimeSlots(
  start: string = WORK_DAY_START,
  end: string = WORK_DAY_END,
  stepMinutes: number = SLOT_STEP_MINUTES
): string[] {
  const startMins = timeToMinutes(start);
  const endMins = timeToMinutes(end);

  if (startMins > endMins) {
    throw new Error(`Время начала (${start}) не может быть позже окончания (${end}).`);
  }
  if (stepMinutes <= 0) {
    throw new Error('Шаг генерации слотов должен быть больше 0 минут.');
  }

  const slots: string[] = [];
  for (let current = startMins; current <= endMins; current += stepMinutes) {
    slots.push(minutesToTime(current));
  }
  return slots;
}

/**
 * Форматирует переданную дату в локальный формат YYYY-MM-DD (без сдвигов UTC).
 */
export function formatDateIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
