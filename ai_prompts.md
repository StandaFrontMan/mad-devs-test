# AI Prompts History

## Prompt 1: Настройка MSW v2 и базового мок-сервера

### Задачи:
1. **Установка зависимостей:**
   - Установи `msw` в devDependencies (`bun add -d msw`).
   - Инициализируй Service Worker в директорию `public`: выполни команду `bunx msw init public/ --save`.
2. **Создай типы контракта (`src/domain/booking.ts`):**
   ```typescript
   export type Booking = {
     id: string;
     date: string; // Формат: YYYY-MM-DD
     start: string; // Формат: HH:mm
     end: string; // Формат: HH:mm
     title?: string;
   };
   export type CreateBookingDto = Omit<Booking, 'id'>;
   export type UpdateBookingDto = Partial<CreateBookingDto>;
   export type ApiErrorResponse = {
     code: 'CONFLICT' | 'VALIDATION_ERROR' | 'NOT_FOUND' | 'BAD_REQUEST';
     message: string;
     conflictingBookings?: Booking[];
   };
   ```
3. **Создай in-memory хранилище с персистентностью в sessionStorage (`src/mocks/db.ts`):**
   - Реализуй класс или модуль хранилища `bookingDb`.
   - Ключ хранения: `'meeting_room_bookings_v1'`.
   - При первой инициализации, если `sessionStorage` пуст, заполни хранилище начальными seed-данными:
     - 2-3 бронирования на сегодняшнюю дату (например: `10:00-11:00` "Daily Standup", `14:00-15:30` "Product Review").
     - 1-2 бронирования на завтрашний рабочий день.
   - Реализуй методы:
     - `getByDate(date: string): Booking[]` (отсортированные по возрастанию `start`)
     - `getById(id: string): Booking | undefined`
     - `create(dto: CreateBookingDto): Booking` (генерируй `id` через `crypto.randomUUID()`)
     - `update(id: string, dto: UpdateBookingDto): Booking | null`
     - `delete(id: string): boolean`
     - `reset(): void` (для отладки)
   - При каждом изменении (create/update/delete) сохраняй актуальный массив в `sessionStorage`.
4. **Создай MSW handlers (`src/mocks/handlers.ts`):**
   Используй API MSW v2 (`http`, `HttpResponse`, `delay` из пакета `'msw'`).
   Добавь искусственную задержку `await delay(250)` для реалистичности сетевых состояний.
   Реализуй роуты строго по ТЗ:
   - `GET /api/bookings?date=YYYY-MM-DD`:
     - Если параметр `date` не передан — вернуть статус 400 (`BAD_REQUEST`).
     - Вернуть JSON-массив бронирований на эту дату.
   - `POST /api/bookings`:
     - Принимает `CreateBookingDto`.
     - Возвращает созданный `Booking` со статусом 201.
   - `PATCH /api/bookings/:id`:
     - Обновляет поля существующей брони.
     - Если бронь не найдена — вернуть статус 404.
     - Возвращает обновленный `Booking` со статусом 200.
   - `DELETE /api/bookings/:id`:
     - Удаляет бронь по id.
     - Если не найдена — 404.
     - При успехе вернуть пустой ответ со статусом 204 No Content.
   *(Примечание: пока без глубокой бизнес-валидации пересечений — её мы вынесем в чистый domain-модуль на следующем шаге).*
5. **Создай точку входа worker (`src/mocks/browser.ts`):**
   ```typescript
   import { setupWorker } from 'msw/browser';
   import { handlers } from './handlers';
   export const worker = setupWorker(...handlers);
   ```
6. **Подключи MSW в `src/main.tsx`:**
   - Сделай асинхронную функцию `enableMocking()`, которая вызывает `worker.start({ onUnhandledRequest: 'bypass' })`.
   - Дождись старта worker перед вызовом `ReactDOM.createRoot().render(...)`.
7. **Проверь работоспособность:**
   В `src/App.tsx` выведи простую проверку: кнопку «Проверить API броней», которая делает `fetch('/api/bookings?date=' + сегодняшняя_дата)` и выводит список броней в консоль или на экран.
Убедись, что проект собирается без ошибок TypeScript (`bun run build`).
