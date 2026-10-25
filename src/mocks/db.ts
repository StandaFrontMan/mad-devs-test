import type { Booking, CreateBookingDto, UpdateBookingDto } from '@/domain/booking';

const STORAGE_KEY = 'meeting_room_bookings_v1';

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getSeedData = (): Booking[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayStr = formatDate(today);
  const tomorrowStr = formatDate(tomorrow);

  return [
    {
      id: 'seed-1',
      date: todayStr,
      start: '10:00',
      end: '11:00',
      title: 'Daily Standup & Sync',
    },
    {
      id: 'seed-2',
      date: todayStr,
      start: '13:00',
      end: '14:30',
      title: 'Design Review: Q4 Roadmap',
    },
    {
      id: 'seed-3',
      date: todayStr,
      start: '16:00',
      end: '17:00',
      title: '1-on-1 Catchup',
    },
    {
      id: 'seed-4',
      date: tomorrowStr,
      start: '11:30',
      end: '12:30',
      title: 'Architecture Discussion',
    },
    {
      id: 'seed-5',
      date: tomorrowStr,
      start: '15:00',
      end: '16:30',
      title: 'Client Demo',
    },
  ];
};

class BookingDatabase {
  private bookings: Booking[] = [];

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window === 'undefined') {
      this.bookings = getSeedData();
      return;
    }

    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.bookings = JSON.parse(stored);
      } else {
        this.bookings = getSeedData();
        this.persist();
      }
    } catch {
      this.bookings = getSeedData();
    }
  }

  private persist() {
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.bookings));
      } catch (err) {
        console.error('Failed to persist bookings to sessionStorage', err);
      }
    }
  }

  public getByDate(date: string): Booking[] {
    return this.bookings
      .filter((b) => b.date === date)
      .sort((a, b) => a.start.localeCompare(b.start));
  }

  public getById(id: string): Booking | undefined {
    return this.bookings.find((b) => b.id === id);
  }

  public create(dto: CreateBookingDto): Booking {
    const newBooking: Booking = {
      ...dto,
      id: crypto.randomUUID(),
    };
    this.bookings.push(newBooking);
    this.persist();
    return newBooking;
  }

  public update(id: string, dto: UpdateBookingDto): Booking | null {
    const index = this.bookings.findIndex((b) => b.id === id);
    if (index === -1) {
      return null;
    }

    const current = this.bookings[index];
    const updated: Booking = {
      ...current,
      ...dto,
      id: current.id,
    };

    this.bookings[index] = updated;
    this.persist();
    return updated;
  }

  public delete(id: string): boolean {
    const initialLen = this.bookings.length;
    this.bookings = this.bookings.filter((b) => b.id !== id);
    const deleted = this.bookings.length !== initialLen;
    if (deleted) {
      this.persist();
    }
    return deleted;
  }

  public reset(): void {
    this.bookings = getSeedData();
    this.persist();
  }
}

export const bookingDb = new BookingDatabase();
