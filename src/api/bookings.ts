import { request } from './client';
import type { Booking, CreateBookingDto, UpdateBookingDto } from '@/domain/booking';

export const bookingsApi = {
  /**
   * Получить список всех бронирований на конкретную дату (YYYY-MM-DD).
   */
  async getBookings(date: string): Promise<Booking[]> {
    return request<Booking[]>(`/api/bookings?date=${encodeURIComponent(date)}`);
  },

  /**
   * Создать новое бронирование.
   */
  async createBooking(dto: CreateBookingDto): Promise<Booking> {
    return request<Booking>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Обновить существующее бронирование.
   */
  async updateBooking(id: string, dto: UpdateBookingDto): Promise<Booking> {
    return request<Booking>(`/api/bookings/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Удалить бронирование по ID.
   */
  async deleteBooking(id: string): Promise<void> {
    return request<void>(`/api/bookings/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};
