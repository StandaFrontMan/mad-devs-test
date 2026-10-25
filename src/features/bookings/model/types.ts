import type { Booking } from '@/domain/booking';

export type SlotStatus = 'free' | 'busy' | 'past';

export type TimelineSlot = {
  start: string; // HH:mm
  end: string;   // HH:mm
  status: SlotStatus;
  booking?: Booking;
  isFirstSlotOfBooking?: boolean;
  spanSlots?: number; // Сколько 30-минутных слотов занимает бронь
};
