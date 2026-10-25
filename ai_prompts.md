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

---

## Prompt 2: Генерация сетки слотов времени и юнит-тесты для time.ts

В модуле `src/domain/time.ts` уже реализованы базовые константы рабочего дня и утилиты конвертации:
- `isValidTimeFormat(time: string): boolean`
- `timeToMinutes(time: string): number`
- `minutesToTime(minutes: number): string`

### Задачи:
1. **Реализовать функцию генерации слотов в `src/domain/time.ts`:**
   - На основе существующих `timeToMinutes` и `minutesToTime` реализовать функцию:
     ```typescript
     export function generateTimeSlots(
       start: string = WORK_DAY_START,
       end: string = WORK_DAY_END,
       stepMinutes: number = SLOT_STEP_MINUTES
     ): string[]
     ```
   - Функция должна возвращать массив строк `HH:mm` от `start` до `end` включительно с шагом `stepMinutes` (по умолчанию: `['09:00', '09:30', ..., '17:30', '18:00']`).
   - Валидировать, что `start <= end` и `stepMinutes > 0`, иначе выбрасывать ошибку с понятным сообщением.
   - Экспортировать утилиту `formatDateIso(date: Date): string` для локального форматирования `YYYY-MM-DD`.

2. **Покрыть модуль `src/domain/time.ts` юнит-тестами на Vitest (`src/domain/__tests__/time.test.ts`):**
   - Проверить валидацию формата `isValidTimeFormat` (валидные и невалидные строки, пустые значения).
   - Проверить перевод `timeToMinutes` и обратно `minutesToTime` на граничных значениях (`00:00`, `09:00`, `18:00`, `23:59`) и обработку некорректного ввода.
   - Проверить `generateTimeSlots` (правильное количество слотов для рабочего дня 09:00–18:00 с шагом 30 мин, поддержка кастомных диапазонов).
   - Проверить форматирование `formatDateIso`.

Убедись, что все тесты проходят (`bun run test`) и сборка не ломается (`bun run build`).

---

## Prompt 3: Реализация 8 бизнес-правил бронирования и юнит-тестов (rules.ts)

Необходимо реализовать чистую доменную логику валидации бронирований переговорной комнаты строго по бизнес-правилам ТЗ.

### Бизнес-правила:
1. Время начала и окончания — в пределах рабочего дня (09:00–18:00).
2. `start < end`.
3. Минимальная длительность — 30 минут.
4. Максимальная длительность — 2 часа (120 минут).
5. Бронирования не могут пересекаться (`a.start < b.end && b.start < a.end`). Касание границ конфликтом не считается (`10:00–11:00` и `11:00–12:00` — допустимо).
6. Нельзя бронировать прошедшее время:
   - Для прошедших дат создание брони недоступно.
   - Для сегодняшней даты прошедшие слоты недоступны.
   - Передавать `now: Date = new Date()` в качестве параметра для детерминированности.
7. При редактировании текущая бронь не должна конфликтовать сама с собой (исключение по `id`).
8. Агрегирующая валидация: возврат понятного объекта ошибок и типизированного кода (`'CONFLICT' | 'VALIDATION_ERROR' | 'PAST_TIME'`).

### Задачи:
1. **Создать модуль `src/domain/rules.ts` с функциями:**
   - `isWithinWorkDay(start: string, end: string): boolean`
   - `isStartBeforeEnd(start: string, end: string): boolean`
   - `getDurationMinutes(start: string, end: string): number`
   - `isValidDuration(start: string, end: string): boolean`
   - `hasOverlap(a: { start: string; end: string }, b: { start: string; end: string }): boolean`
   - `isPastBooking(date: string, startTime: string, now?: Date): boolean`
   - `findConflictingBookings(candidate, existingBookings, excludeBookingId?): Booking[]`
   - `validateBooking(candidate, existingBookings, options?): ValidationResult`

2. **Покрыть все правила исчерпывающими юнит-тестами в `src/domain/__tests__/rules.test.ts`:**
   - Граничные условия рабочего дня (09:00, 18:00, выход за границы).
   - Инвертированное время (`start >= end`).
   - Границы длительности: 29 мин (ошибка), 30 мин (ок), 120 мин (ок), 121 мин (ошибка).
   - Все сценарии пересечений: касание стык-в-стык (разрешено), частичное перекрытие, полное поглощение интервала.
   - Прошлое время: вчерашняя дата, слоты сегодня до `now`, слоты сегодня после `now`, будущие дни.
   - Редактирование: расширение своей брони без конфликта с собой, конфликт с чужой бронью.
   - Итоговая функция `validateBooking`.

Убедись, что все тесты проходят (`bun run test`) и сборка не ломается (`bun run build`).
