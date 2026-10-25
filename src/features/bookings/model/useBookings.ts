import { useState, useEffect, useCallback } from 'react';
import { bookingsApi } from '@/api/bookings';
import type { Booking } from '@/domain/booking';

export function useBookings(date: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await bookingsApi.getBookings(date);
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить бронирования.');
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await bookingsApi.getBookings(date);
        if (!isCancelled) {
          setBookings(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Не удалось загрузить бронирования.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isCancelled = true;
    };
  }, [date]);

  return {
    bookings,
    isLoading,
    error,
    refetch: fetchBookings,
    setBookings,
  };
}
