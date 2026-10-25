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
