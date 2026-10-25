import { describe, it, expect } from 'vitest';
import {
  isWithinWorkDay,
  isStartBeforeEnd,
  isValidDuration,
  hasOverlap,
  isPastBooking,
  findConflictingBookings,
  validateBooking,
} from '../rules';
import type { Booking } from '../booking';

describe('domain/rules', () => {
  describe('Правило 1: isWithinWorkDay (09:00–18:00)', () => {
    it('разрешает бронирования строго внутри рабочего дня', () => {
      expect(isWithinWorkDay('09:00', '10:00')).toBe(true);
      expect(isWithinWorkDay('17:00', '18:00')).toBe(true);
      expect(isWithinWorkDay('09:00', '18:00')).toBe(true);
    });

    it('запрещает выход за пределы рабочего дня', () => {
      expect(isWithinWorkDay('08:30', '09:30')).toBe(false);
      expect(isWithinWorkDay('17:30', '18:30')).toBe(false);
      expect(isWithinWorkDay('08:00', '19:00')).toBe(false);
    });
  });

  describe('Правило 2: isStartBeforeEnd (start < end)', () => {
    it('возвращает true если start < end', () => {
      expect(isStartBeforeEnd('09:00', '09:30')).toBe(true);
      expect(isStartBeforeEnd('10:00', '11:00')).toBe(true);
    });

    it('возвращает false если start >= end', () => {
      expect(isStartBeforeEnd('10:00', '10:00')).toBe(false);
      expect(isStartBeforeEnd('11:00', '10:00')).toBe(false);
    });
  });

  describe('Правила 3 и 4: isValidDuration (30 мин - 2 часа)', () => {
    it('разрешает минимальную длительность ровно 30 минут', () => {
      expect(isValidDuration('10:00', '10:30')).toBe(true);
    });

    it('запрещает длительность менее 30 минут', () => {
      expect(isValidDuration('10:00', '10:29')).toBe(false);
      expect(isValidDuration('10:00', '10:15')).toBe(false);
    });

    it('разрешает максимальную длительность ровно 2 часа (120 мин)', () => {
      expect(isValidDuration('10:00', '12:00')).toBe(true);
    });

    it('запрещает длительность более 2 часов', () => {
      expect(isValidDuration('10:00', '12:01')).toBe(false);
      expect(isValidDuration('10:00', '13:00')).toBe(false);
    });
  });

  describe('Правило 5: hasOverlap (пересечения)', () => {
    const existing = { start: '11:00', end: '12:30' };

    it('касание границ стык-в-стык НЕ считается конфликтом', () => {
      // Заканчивается прямо перед existing
      expect(hasOverlap({ start: '10:00', end: '11:00' }, existing)).toBe(false);
      // Начинается прямо после existing
      expect(hasOverlap({ start: '12:30', end: '13:30' }, existing)).toBe(false);
    });

    it('фиксирует конфликт при частичном наложении слева или справа', () => {
      expect(hasOverlap({ start: '10:30', end: '11:30' }, existing)).toBe(true);
      expect(hasOverlap({ start: '12:00', end: '13:00' }, existing)).toBe(true);
    });

    it('фиксирует конфликт при полном поглощении', () => {
      // Кандидат внутри существующего
      expect(hasOverlap({ start: '11:15', end: '12:15' }, existing)).toBe(true);
      // Кандидат полностью охватывает существующий
      expect(hasOverlap({ start: '10:00', end: '13:00' }, existing)).toBe(true);
      // Идентичные интервалы
      expect(hasOverlap({ start: '11:00', end: '12:30' }, existing)).toBe(true);
    });
  });

  describe('Правило 6: isPastBooking (прошедшее время)', () => {
    // Фиксированная точка во времени: 2026-05-20 14:00
    const fixedNow = new Date(2026, 4, 20, 14, 0);

    it('запрещает любые бронирования на прошедшие даты', () => {
      expect(isPastBooking('2026-05-19', '15:00', fixedNow)).toBe(true);
    });

    it('для сегодняшней даты запрещает прошедшие слоты по времени начала', () => {
      // 13:30 < 14:00 (прошлое)
      expect(isPastBooking('2026-05-20', '13:30', fixedNow)).toBe(true);
      // 14:00 <= 14:00 (настоящий момент считается доступным)
      expect(isPastBooking('2026-05-20', '14:00', fixedNow)).toBe(false);
      // 14:30 > 14:00 (будущее сегодня)
      expect(isPastBooking('2026-05-20', '14:30', fixedNow)).toBe(false);
    });

    it('разрешает бронирования на будущие даты', () => {
      expect(isPastBooking('2026-05-21', '09:00', fixedNow)).toBe(false);
    });
  });

  describe('Правило 7: findConflictingBookings (редактирование без конфликта с собой)', () => {
    const bookings: Booking[] = [
      { id: '1', date: '2026-05-20', start: '10:00', end: '11:00', title: 'Meeting 1' },
      { id: '2', date: '2026-05-20', start: '14:00', end: '15:00', title: 'Meeting 2' },
      { id: '3', date: '2026-05-21', start: '10:00', end: '11:00', title: 'Meeting Tomorrow' },
    ];

    it('не считает конфликтом изменение брони, если она пересекается сама с собой', () => {
      // Редактируем бронь 1: расширяем с 10:00-11:00 до 10:00-11:30
      const candidate = { id: '1', date: '2026-05-20', start: '10:00', end: '11:30' };
      const conflicts = findConflictingBookings(candidate, bookings, '1');
      expect(conflicts).toHaveLength(0);
    });

    it('находит конфликт с чужой бронью на ту же дату', () => {
      // Пытаемся подвинуть бронь 1 на 14:30-15:30 (пересекается с бронью 2)
      const candidate = { id: '1', date: '2026-05-20', start: '14:30', end: '15:30' };
      const conflicts = findConflictingBookings(candidate, bookings, '1');
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].id).toBe('2');
    });

    it('игнорирует бронирования на другие даты', () => {
      const candidate = { date: '2026-05-21', start: '12:00', end: '13:00' };
      const conflicts = findConflictingBookings(candidate, bookings);
      expect(conflicts).toHaveLength(0);
    });
  });

  describe('Комплексная validateBooking', () => {
    const existing: Booking[] = [
      { id: 'b1', date: '2026-05-20', start: '10:00', end: '11:00' },
    ];
    const fixedNow = new Date(2026, 4, 20, 9, 0);

    it('возвращает isValid: true для корректной брони', () => {
      const result = validateBooking(
        { date: '2026-05-20', start: '11:00', end: '12:00' },
        existing,
        { now: fixedNow }
      );
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('возвращает CONFLICT при пересечении', () => {
      const result = validateBooking(
        { date: '2026-05-20', start: '10:30', end: '11:30' },
        existing,
        { now: fixedNow }
      );
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('CONFLICT');
      expect(result.conflictingBookings).toHaveLength(1);
    });

    it('возвращает PAST_TIME при попытке бронирования в прошлом', () => {
      const result = validateBooking(
        { date: '2026-05-19', start: '10:00', end: '11:00' },
        existing,
        { now: fixedNow }
      );
      expect(result.isValid).toBe(false);
      expect(result.code).toBe('PAST_TIME');
    });
  });
});
