import { describe, it, expect } from 'vitest';
import {
  WORK_DAY_START,
  WORK_DAY_END,
  SLOT_STEP_MINUTES,
  isValidTimeFormat,
  timeToMinutes,
  minutesToTime,
  generateTimeSlots,
  formatDateIso,
} from '../time';

describe('domain/time', () => {
  describe('isValidTimeFormat', () => {
    it('валидирует корректные форматы HH:mm', () => {
      expect(isValidTimeFormat('00:00')).toBe(true);
      expect(isValidTimeFormat('09:00')).toBe(true);
      expect(isValidTimeFormat('18:30')).toBe(true);
      expect(isValidTimeFormat('23:59')).toBe(true);
    });

    it('отклоняет некорректные форматы времени', () => {
      expect(isValidTimeFormat('9:00')).toBe(false);
      expect(isValidTimeFormat('24:00')).toBe(false);
      expect(isValidTimeFormat('12:60')).toBe(false);
      expect(isValidTimeFormat('abc')).toBe(false);
      expect(isValidTimeFormat('')).toBe(false);
    });
  });

  describe('timeToMinutes & minutesToTime', () => {
    it('корректно переводит HH:mm в минуты от полуночи', () => {
      expect(timeToMinutes('00:00')).toBe(0);
      expect(timeToMinutes('09:00')).toBe(540);
      expect(timeToMinutes('09:30')).toBe(570);
      expect(timeToMinutes('18:00')).toBe(1080);
      expect(timeToMinutes('23:59')).toBe(1439);
    });

    it('корректно переводит минуты обратно в HH:mm', () => {
      expect(minutesToTime(0)).toBe('00:00');
      expect(minutesToTime(540)).toBe('09:00');
      expect(minutesToTime(570)).toBe('09:30');
      expect(minutesToTime(1080)).toBe('18:00');
      expect(minutesToTime(1439)).toBe('23:59');
    });

    it('выбрасывает ошибку при некорректном вводе', () => {
      expect(() => timeToMinutes('invalid')).toThrow();
      expect(() => minutesToTime(-1)).toThrow();
      expect(() => minutesToTime(1440)).toThrow();
    });
  });

  describe('generateTimeSlots', () => {
    it('генерирует правильные 30-минутные слоты для рабочего дня 09:00-18:00', () => {
      const slots = generateTimeSlots();
      expect(slots[0]).toBe(WORK_DAY_START); // "09:00"
      expect(slots[slots.length - 1]).toBe(WORK_DAY_END); // "18:00"
      expect(slots).toContain('09:30');
      expect(slots).toContain('12:00');
      expect(slots).toContain('17:30');
      // Всего от 09:00 до 18:00 включительно с шагом 30 минут: 19 слотов
      expect(slots.length).toBe(19);
    });

    it('поддерживает кастомные интервалы и шаг', () => {
      const slots = generateTimeSlots('10:00', '11:00', SLOT_STEP_MINUTES);
      expect(slots).toEqual(['10:00', '10:30', '11:00']);
    });
  });

  describe('formatDateIso', () => {
    it('форматирует дату без сдвигов таймзоны', () => {
      const testDate = new Date(2026, 4, 15); // 15 мая 2026
      expect(formatDateIso(testDate)).toBe('2026-05-15');
    });
  });
});
