import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Booking } from '@/domain/booking';

function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function App() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayStr = getTodayString();

  const handleFetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/bookings?date=${todayStr}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = (await res.json()) as Booking[];
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-8 max-w-3xl mx-auto flex flex-col gap-6">
      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Бронирование переговорной комнаты</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Рабочий день: 09:00–18:00 • Сегодня: <span className="font-mono font-medium">{todayStr}</span>
        </p>
      </header>

      <section className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Статус MSW & API</h2>
            <p className="text-xs text-muted-foreground">
              Проверка работы Mock Service Worker и эндпоинта <code className="text-primary">GET /api/bookings</code>
            </p>
          </div>
          <Button onClick={handleFetchBookings} disabled={loading}>
            {loading ? 'Загрузка...' : 'Проверить API броней'}
          </Button>
        </div>

        {error && (
          <div className="p-3 text-sm rounded bg-destructive/15 text-destructive border border-destructive/30">
            Ошибка запроса: {error}
          </div>
        )}

        {bookings && (
          <div className="flex flex-col gap-2 mt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Найдено бронирований: {bookings.length}
            </h3>
            <ul className="divide-y border rounded-md">
              {bookings.length === 0 ? (
                <li className="p-3 text-sm text-muted-foreground">На сегодня броней нет</li>
              ) : (
                bookings.map((b) => (
                  <li key={b.id} className="p-3 text-sm flex items-center justify-between">
                    <div>
                      <span className="font-semibold">{b.title || 'Без названия'}</span>
                      <span className="text-muted-foreground ml-2 text-xs">({b.date})</span>
                    </div>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted">
                      {b.start} — {b.end}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
