import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { bookingsApi } from '../bookings';
import { ApiError } from '../client';
import type { Booking, CreateBookingDto } from '@/domain/booking';

describe('api/bookings & client', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('getBookings делает GET запрос с кодированием даты и возвращает список', async () => {
    const mockBookings: Booking[] = [
      { id: '1', date: '2026-10-26', start: '10:00', end: '11:00', title: 'Test Meeting' },
    ];

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockBookings,
    } as Response);

    const result = await bookingsApi.getBookings('2026-10-26');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/bookings?date=2026-10-26',
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
    expect(result).toEqual(mockBookings);
  });

  it('createBooking отправляет POST запрос с сериализованным DTO', async () => {
    const dto: CreateBookingDto = {
      date: '2026-10-26',
      start: '14:00',
      end: '15:00',
      title: 'Design Review',
    };
    const created: Booking = { ...dto, id: 'new-id' };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => created,
    } as Response);

    const result = await bookingsApi.createBooking(dto);

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    expect(result).toEqual(created);
  });

  it('выбрасывает ApiError с кодом CONFLICT и статусом 409 при пересечении', async () => {
    const conflictingBooking: Booking = {
      id: 'existing-1',
      date: '2026-10-26',
      start: '14:30',
      end: '15:30',
      title: 'Existing Event',
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      statusText: 'Conflict',
      json: async () => ({
        code: 'CONFLICT',
        message: 'Выбранное время уже занято.',
        conflictingBookings: [conflictingBooking],
      }),
    } as Response);

    await expect(
      bookingsApi.createBooking({
        date: '2026-10-26',
        start: '14:00',
        end: '15:00',
        title: 'Conflict Attempt',
      })
    ).rejects.toThrowError(ApiError);

    try {
      await bookingsApi.createBooking({
        date: '2026-10-26',
        start: '14:00',
        end: '15:00',
      });
    } catch (err) {
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(409);
      expect(apiErr.code).toBe('CONFLICT');
      expect(apiErr.message).toBe('Выбранное время уже занято.');
      expect(apiErr.conflictingBookings).toEqual([conflictingBooking]);
    }
  });

  it('updateBooking отправляет PATCH запрос на /api/bookings/:id', async () => {
    const updatedBooking: Booking = {
      id: 'book-1',
      date: '2026-10-26',
      start: '10:00',
      end: '11:00',
      title: 'Renamed Meeting',
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => updatedBooking,
    } as Response);

    const result = await bookingsApi.updateBooking('book-1', { title: 'Renamed Meeting' });

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/bookings/book-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Renamed Meeting' }),
    });
    expect(result).toEqual(updatedBooking);
  });

  it('deleteBooking отправляет DELETE запрос и корректно обрабатывает 204 No Content', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => null,
    } as Response);

    await expect(bookingsApi.deleteBooking('book-to-delete')).resolves.toBeUndefined();

    expect(globalThis.fetch).toHaveBeenCalledWith('/api/bookings/book-to-delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
  });
});
