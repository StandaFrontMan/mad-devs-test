import React, { useState, useEffect, useMemo } from 'react';
import { BookingFormModalView } from './BookingFormModalView';
import type { Booking, CreateBookingDto } from '@/domain/booking';
import {
  WORK_DAY_START,
  WORK_DAY_END,
  SLOT_STEP_MINUTES,
  MIN_DURATION_MINUTES,
  MAX_DURATION_MINUTES,
  generateTimeSlots,
  timeToMinutes,
  minutesToTime,
} from '@/domain/time';
import {
  isStartBeforeEnd,
  isValidDuration,
  getDurationMinutes,
} from '@/domain/rules';

export type BookingFormModalContainerProps = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  date: string;
  initialData?: Partial<Booking>;
  serverError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBookingDto) => void;
};

export const BookingFormModalContainer: React.FC<BookingFormModalContainerProps> = ({
  isOpen,
  mode,
  date,
  initialData,
  serverError,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  // Доступные слоты для выбора
  const allSlots = useMemo(
    () => generateTimeSlots(WORK_DAY_START, WORK_DAY_END, SLOT_STEP_MINUTES),
    []
  );

  const startOptions = useMemo(() => allSlots.slice(0, allSlots.length - 1), [allSlots]);
  const endOptions = useMemo(() => allSlots.slice(1), [allSlots]);

  const [title, setTitle] = useState('');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('10:00');

  // Инициализация при открытии модалки
  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      const defaultStart = initialData?.start || '09:00';
      setStart(defaultStart);

      if (initialData?.end) {
        setEnd(initialData.end);
      } else {
        // По умолчанию +1 час или +30 мин
        const startMins = timeToMinutes(defaultStart);
        const preferredEndMins = Math.min(startMins + 60, timeToMinutes(WORK_DAY_END));
        setEnd(minutesToTime(preferredEndMins));
      }
    }
  }, [isOpen, initialData]);

  // Закрытие по Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Вычисление длительности и валидация
  const { durationLabel, isDurationValid, validationError } = useMemo(() => {
    if (!isStartBeforeEnd(start, end)) {
      return {
        durationLabel: 'Некорректно',
        isDurationValid: false,
        validationError: 'Время окончания должно быть позже времени начала.',
      };
    }

    const duration = getDurationMinutes(start, end);
    const valid = isValidDuration(start, end);

    let error: string | null = null;
    if (duration < MIN_DURATION_MINUTES) {
      error = `Минимальная длительность встречи — ${MIN_DURATION_MINUTES} минут.`;
    } else if (duration > MAX_DURATION_MINUTES) {
      error = `Максимальная длительность встречи — ${MAX_DURATION_MINUTES / 60} часа (120 минут).`;
    }

    const label =
      duration >= 60
        ? `${Math.floor(duration / 60)} ч ${duration % 60 ? `${duration % 60} мин` : ''}`.trim()
        : `${duration} мин`;

    return {
      durationLabel: label,
      isDurationValid: valid,
      validationError: error,
    };
  }, [start, end]);

  const handleStartChange = (newStart: string) => {
    setStart(newStart);
    // Автоматически подстраиваем окончание, чтобы было ровно 1 час или 30 минут
    const startMins = timeToMinutes(newStart);
    const currentEndMins = timeToMinutes(end);

    if (currentEndMins <= startMins || currentEndMins - startMins > MAX_DURATION_MINUTES) {
      const newEndMins = Math.min(startMins + 60, timeToMinutes(WORK_DAY_END));
      setEnd(minutesToTime(newEndMins));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDurationValid || validationError || isSubmitting) return;

    onSubmit({
      date,
      start,
      end,
      title: title.trim() || undefined,
    });
  };

  return (
    <BookingFormModalView
      isOpen={isOpen}
      mode={mode}
      title={title}
      start={start}
      end={end}
      date={date}
      startOptions={startOptions}
      endOptions={endOptions}
      durationLabel={durationLabel}
      isDurationValid={isDurationValid}
      validationError={validationError}
      serverError={serverError}
      isSubmitting={isSubmitting}
      onTitleChange={setTitle}
      onStartChange={handleStartChange}
      onEndChange={setEnd}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
};
