import { http, HttpResponse, delay } from 'msw';
import { bookingDb } from './db';
import type { CreateBookingDto, UpdateBookingDto, ApiErrorResponse } from '@/domain/booking';

export const handlers = [
  // GET /api/bookings?date=YYYY-MM-DD
  http.get('/api/bookings', async ({ request }) => {
    await delay(250);

    const url = new URL(request.url);
    const date = url.searchParams.get('date');

    if (!date) {
      const error: ApiErrorResponse = {
        code: 'BAD_REQUEST',
        message: 'Параметр "date" (YYYY-MM-DD) обязателен.',
      };
      return HttpResponse.json(error, { status: 400 });
    }

    const bookings = bookingDb.getByDate(date);
    return HttpResponse.json(bookings, { status: 200 });
  }),

  // POST /api/bookings
  http.post('/api/bookings', async ({ request }) => {
    await delay(250);

    const body = (await request.json()) as CreateBookingDto;

    if (!body || !body.date || !body.start || !body.end) {
      const error: ApiErrorResponse = {
        code: 'VALIDATION_ERROR',
        message: 'Поля date, start и end обязательны для заполнения.',
      };
      return HttpResponse.json(error, { status: 400 });
    }

    const created = bookingDb.create(body);
    return HttpResponse.json(created, { status: 201 });
  }),

  // PATCH /api/bookings/:id
  http.patch('/api/bookings/:id', async ({ params, request }) => {
    await delay(250);

    const { id } = params;
    if (typeof id !== 'string') {
      return HttpResponse.json(
        { code: 'BAD_REQUEST', message: 'Некорректный идентификатор.' } satisfies ApiErrorResponse,
        { status: 400 }
      );
    }

    const body = (await request.json()) as UpdateBookingDto;
    const updated = bookingDb.update(id, body);

    if (!updated) {
      const error: ApiErrorResponse = {
        code: 'NOT_FOUND',
        message: `Бронирование с id "${id}" не найдено.`,
      };
      return HttpResponse.json(error, { status: 404 });
    }

    return HttpResponse.json(updated, { status: 200 });
  }),

  // DELETE /api/bookings/:id
  http.delete('/api/bookings/:id', async ({ params }) => {
    await delay(250);

    const { id } = params;
    if (typeof id !== 'string') {
      return HttpResponse.json(
        { code: 'BAD_REQUEST', message: 'Некорректный идентификатор.' } satisfies ApiErrorResponse,
        { status: 400 }
      );
    }

    const deleted = bookingDb.delete(id);
    if (!deleted) {
      const error: ApiErrorResponse = {
        code: 'NOT_FOUND',
        message: `Бронирование с id "${id}" не найдено.`,
      };
      return HttpResponse.json(error, { status: 404 });
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
