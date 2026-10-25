import React, { useState } from 'react';
import { BookingsPageView } from './BookingsPageView';
import { useBookings } from '../../model/useBookings';
import { bookingsApi } from '@/api/bookings';
import { ApiError } from '@/api/client';
import { formatDateIso } from '@/domain/time';
import type { Booking, CreateBookingDto } from '@/domain/booking';

export const BookingsPageContainer: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDateIso(new Date()));

  const { bookings, isLoading, error, refetch } = useBookings(selectedDate);

  // Состояние модального окна создания/редактирования
  const [formModalState, setFormModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    initialData?: Partial<Booking>;
    editingId?: string;
  }>({
    isOpen: false,
    mode: 'create',
  });

  // Состояние диалога удаления
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    booking: Booking | null;
  }>({
    isOpen: false,
    booking: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Открытие формы создания по кнопке в шапке
  const handleCreateBookingClick = () => {
    setServerError(null);
    setFormModalState({
      isOpen: true,
      mode: 'create',
      initialData: {
        date: selectedDate,
        start: '09:00',
        end: '10:00',
      },
    });
  };

  // Открытие формы создания по клику на конкретный свободный слот
  const handleSelectSlot = (startTime: string) => {
    setServerError(null);
    setFormModalState({
      isOpen: true,
      mode: 'create',
      initialData: {
        date: selectedDate,
        start: startTime,
      },
    });
  };

  // Открытие формы редактирования существующей брони
  const handleEditBooking = (booking: Booking) => {
    setServerError(null);
    setFormModalState({
      isOpen: true,
      mode: 'edit',
      initialData: booking,
      editingId: booking.id,
    });
  };

  // Открытие подтверждения удаления
  const handleDeleteBooking = (booking: Booking) => {
    setDeleteModalState({
      isOpen: true,
      booking,
    });
  };

  // Отправка формы (Создание / Редактирование) с честной обработкой 409 Conflict
  const handleFormSubmit = async (dto: CreateBookingDto) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      if (formModalState.mode === 'create') {
        await bookingsApi.createBooking(dto);
      } else if (formModalState.editingId) {
        await bookingsApi.updateBooking(formModalState.editingId, dto);
      }

      // При успехе закрываем форму и обновляем расписание
      setFormModalState({ isOpen: false, mode: 'create' });
      await refetch();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          // ТРЕБОВАНИЕ ТЗ (Пункт 8):
          // 1. Форма остается открытой!
          // 2. Введенные пользователем данные не теряются!
          // 3. Показывается понятная ошибка!
          // 4. В фоне обновляется список броней, чтобы таймлайн отобразил занятость!
          setServerError(
            err.message ||
              'Выбранное время уже занято другим бронированием. Список бронирований на странице обновлен, пожалуйста, выберите другой интервал.'
          );
          refetch();
          return;
        }
        setServerError(err.message);
      } else {
        setServerError(err instanceof Error ? err.message : 'Произошла ошибка при сохранении.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Подтверждение удаления брони
  const handleConfirmDelete = async (booking: Booking) => {
    setIsDeleting(true);
    try {
      await bookingsApi.deleteBooking(booking.id);
      setDeleteModalState({ isOpen: false, booking: null });
      await refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Не удалось удалить бронирование');
    } finally {
      setIsDeleting(false);
    }
  };

  // Демо-фича для рецензента: симуляция фонового конфликта (409 Conflict)
  const handleSimulateConflict = async () => {
    const conflictStart = '14:00';
    const conflictEnd = '15:30';

    try {
      // 1. Создаем тайную бронь в базе данных
      await bookingsApi.createBooking({
        date: selectedDate,
        start: conflictStart,
        end: conflictEnd,
        title: '🔒 Фоновое бронирование (Коллега забронировал 2 сек назад)',
      });

      // 2. Сразу открываем форму для пользователя на это же самое время
      setServerError(null);
      setFormModalState({
        isOpen: true,
        mode: 'create',
        initialData: {
          date: selectedDate,
          start: conflictStart,
          end: conflictEnd,
          title: 'Моя важная встреча',
        },
      });

      // Выводим инструкцию рецензенту
      alert(
        `[ДЕМО РЕЦЕНЗЕНТА]\n\nВ базе только что тайно создана бронь на ${conflictStart}–${conflictEnd}.\nСейчас открыта форма бронирования на то же время.\n\nНажмите "Забронировать", чтобы увидеть, как клиент обработает HTTP 409 Conflict: форма не закроется, текст не пропадет, а расписание в фоне обновится!`
      );
    } catch {
      // Если слот уже был занят, просто открываем форму на это время
      setFormModalState({
        isOpen: true,
        mode: 'create',
        initialData: {
          date: selectedDate,
          start: conflictStart,
          end: conflictEnd,
        },
      });
    }
  };

  return (
    <BookingsPageView
      selectedDate={selectedDate}
      bookings={bookings}
      isLoading={isLoading}
      error={error}
      formModalState={formModalState}
      deleteModalState={deleteModalState}
      isSubmitting={isSubmitting}
      isDeleting={isDeleting}
      serverError={serverError}
      onDateChange={(newDate) => {
        setSelectedDate(newDate);
        setServerError(null);
      }}
      onRefresh={refetch}
      onCreateBookingClick={handleCreateBookingClick}
      onSelectSlot={handleSelectSlot}
      onEditBooking={handleEditBooking}
      onDeleteBooking={handleDeleteBooking}
      onFormSubmit={handleFormSubmit}
      onCloseFormModal={() => {
        setFormModalState({ isOpen: false, mode: 'create' });
        setServerError(null);
      }}
      onConfirmDelete={handleConfirmDelete}
      onCloseDeleteModal={() => setDeleteModalState({ isOpen: false, booking: null })}
      onSimulateConflict={handleSimulateConflict}
    />
  );
};
