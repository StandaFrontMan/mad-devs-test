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
