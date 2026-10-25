import React, { useState } from 'react';
import { BookingsPageView } from './BookingsPageView';
import { useBookings } from '../../model/useBookings';
import { formatDateIso } from '@/domain/time';
import type { Booking } from '@/domain/booking';

export const BookingsPageContainer: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateIso(new Date()));

  const { bookings, isLoading, error, refetch } = useBookings(selectedDate);

  const handleCreateBookingClick = () => {
    // В следующем шаге 5.2 здесь будет открываться модалка создания
    console.log('Создать бронирование на дату:', selectedDate);
  };

  const handleSelectSlot = (startTime: string) => {
    // В следующем шаге 5.2 открываем форму с предзаполненным временем начала
    console.log('Выбран слот:', startTime, 'на дату:', selectedDate);
  };

  const handleEditBooking = (booking: Booking) => {
    // В следующем шаге 5.2 открываем форму редактирования
    console.log('Редактировать бронирование:', booking);
  };

  const handleDeleteBooking = (booking: Booking) => {
    // В следующем шаге 5.2 открываем диалог подтверждения удаления
    console.log('Удалить бронирование:', booking);
  };

  return (
    <BookingsPageView
      selectedDate={selectedDate}
      bookings={bookings}
      isLoading={isLoading}
      error={error}
      onDateChange={setSelectedDate}
      onRefresh={refetch}
      onCreateBookingClick={handleCreateBookingClick}
      onSelectSlot={handleSelectSlot}
      onEditBooking={handleEditBooking}
      onDeleteBooking={handleDeleteBooking}
    />
  );
};
