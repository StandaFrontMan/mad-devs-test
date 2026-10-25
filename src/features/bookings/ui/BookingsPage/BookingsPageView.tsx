import React from 'react';
import { Plus, AlertCircle, RefreshCw, Sparkles, Building2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateSelectorContainer } from '../DateSelector/DateSelectorContainer';
import { TimelineContainer } from '../Timeline/TimelineContainer';
import { BookingFormModalContainer } from '../BookingFormModal/BookingFormModalContainer';
import { DeleteBookingModalContainer } from '../DeleteBookingModal/DeleteBookingModalContainer';
import type { Booking, CreateBookingDto } from '@/domain/booking';

export type BookingsPageViewProps = {
  selectedDate: string;
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  formModalState: {
    isOpen: boolean;
    mode: 'create' | 'edit';
    initialData?: Partial<Booking>;
  };
  deleteModalState: {
    isOpen: boolean;
    booking: Booking | null;
  };
  isSubmitting: boolean;
  isDeleting: boolean;
  serverError: string | null;
  onDateChange: (date: string) => void;
  onRefresh: () => void;
  onCreateBookingClick: () => void;
  onSelectSlot: (startTime: string) => void;
  onEditBooking: (booking: Booking) => void;
  onDeleteBooking: (booking: Booking) => void;
  onFormSubmit: (data: CreateBookingDto) => void;
  onCloseFormModal: () => void;
  onConfirmDelete: (booking: Booking) => void;
  onCloseDeleteModal: () => void;
  onSimulateConflict: () => void;
};

export const BookingsPageView: React.FC<BookingsPageViewProps> = ({
  selectedDate,
  bookings,
  isLoading,
  error,
  formModalState,
  deleteModalState,
  isSubmitting,
  isDeleting,
  serverError,
  onDateChange,
  onRefresh,
  onCreateBookingClick,
  onSelectSlot,
  onEditBooking,
  onDeleteBooking,
  onFormSubmit,
  onCloseFormModal,
  onConfirmDelete,
  onCloseDeleteModal,
  onSimulateConflict,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased flex flex-col">
      {/* Верхняя навигация / Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <Building2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Переговорная «Орион»
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Рабочий день 09:00–18:00 • Вместимость: 10 человек
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Кнопка симуляции фонового конфликта для рецензента */}
            <Button
              variant="outline"
              size="sm"
              onClick={onSimulateConflict}
              title="Создает бронь в базе в обход UI для проверки обработки ошибки 409 Conflict"
              className="hidden md:inline-flex gap-1.5 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300 font-medium cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Симулировать конфликт (409)</span>
            </Button>

            <Button
              onClick={onCreateBookingClick}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm font-semibold cursor-pointer h-9 px-4 rounded-lg"
              aria-label="Создать новое бронирование"
            >
              <Plus className="w-4 h-4" />
              <span>Забронировать</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 flex flex-col gap-6 flex-1">
        {/* Выбор даты */}
        <DateSelectorContainer
          selectedDate={selectedDate}
          onDateChange={onDateChange}
        />

        {/* Состояние ошибки */}
        {error && (
          <section
            role="alert"
            className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-900 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200 flex items-center justify-between gap-4 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="gap-1.5 shrink-0 border-red-300 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900 text-red-700 dark:text-red-300"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Повторить</span>
            </Button>
          </section>
        )}

        {/* Состояние загрузки (Skeleton) */}
        {isLoading && (
          <section
            aria-label="Загрузка расписания бронирований"
            className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-3 animate-pulse shadow-xs"
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="flex-1 h-11 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
              </div>
            ))}
          </section>
        )}

        {/* Таймлайн слотов */}
        {!isLoading && !error && (
          <>
            {bookings.length === 0 && (
              <div
                role="status"
                className="p-4 rounded-xl border border-blue-200/80 bg-blue-50/60 dark:border-blue-900/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 text-xs flex items-center gap-2.5 shadow-2xs font-medium"
              >
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>
                  На этот день пока нет бронирований — переговорная полностью свободна!
                </span>
              </div>
            )}

            <TimelineContainer
              selectedDate={selectedDate}
              bookings={bookings}
              onSelectSlot={onSelectSlot}
              onEditBooking={onEditBooking}
              onDeleteBooking={onDeleteBooking}
            />
          </>
        )}
      </main>

      {/* Модальное окно создания / редактирования */}
      <BookingFormModalContainer
        isOpen={formModalState.isOpen}
        mode={formModalState.mode}
        date={selectedDate}
        initialData={formModalState.initialData}
        serverError={serverError}
        isSubmitting={isSubmitting}
        onClose={onCloseFormModal}
        onSubmit={onFormSubmit}
      />

      {/* Диалог подтверждения удаления */}
      <DeleteBookingModalContainer
        isOpen={deleteModalState.isOpen}
        booking={deleteModalState.booking}
        isDeleting={isDeleting}
        onClose={onCloseDeleteModal}
        onConfirm={onConfirmDelete}
      />
    </div>
  );
};
