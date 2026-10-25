import React, { useMemo, useState, useEffect } from 'react';
import { TimelineView } from './TimelineView';
import type { TimelineSlot } from '../../model/types';
import type { Booking } from '@/domain/booking';
import {
  WORK_DAY_START,
  WORK_DAY_END,
  SLOT_STEP_MINUTES,
  generateTimeSlots,
  timeToMinutes,
  formatDateIso,
} from '@/domain/time';
import { isPastBooking, hasOverlap } from '@/domain/rules';

export type TimelineContainerProps = {
  selectedDate: string; // YYYY-MM-DD
  bookings: Booking[];
  onSelectSlot?: (startTime: string) => void;
  onEditBooking?: (booking: Booking) => void;
  onDeleteBooking?: (booking: Booking) => void;
};

export const TimelineContainer: React.FC<TimelineContainerProps> = ({
  selectedDate,
  bookings,
  onSelectSlot,
  onEditBooking,
  onDeleteBooking,
}) => {
  // Текущее время с таймером обновления раз в 30 секунд
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = useMemo(() => formatDateIso(now), [now]);
  const isToday = selectedDate === todayStr;

  // Формирование 18 слотов по 30 минут
  const slots: TimelineSlot[] = useMemo(() => {
    const timeLabels = generateTimeSlots(WORK_DAY_START, WORK_DAY_END, SLOT_STEP_MINUTES);
    const result: TimelineSlot[] = [];

    // Пары: [09:00, 09:30], [09:30, 10:00], ..., [17:30, 18:00]
    for (let i = 0; i < timeLabels.length - 1; i++) {
      const slotStart = timeLabels[i];
      const slotEnd = timeLabels[i + 1];

      // Ищем бронь, перекрывающую данный слот
      const matchedBooking = bookings.find((b) =>
        hasOverlap({ start: slotStart, end: slotEnd }, { start: b.start, end: b.end })
      );

      if (matchedBooking) {
        // Определяем, является ли этот слот первым слотом для этой брони
        const isFirst =
          matchedBooking.start === slotStart ||
          timeToMinutes(slotStart) <= timeToMinutes(matchedBooking.start);

        result.push({
          start: slotStart,
          end: slotEnd,
          status: 'busy',
          booking: matchedBooking,
          isFirstSlotOfBooking: isFirst,
        });
      } else {
        const isPast = isPastBooking(selectedDate, slotStart, now);
        result.push({
          start: slotStart,
          end: slotEnd,
          status: isPast ? 'past' : 'free',
        });
      }
    }

    return result;
  }, [selectedDate, bookings, now]);

  // Вычисление позиции маркера "Сейчас"
  const { currentTimePositionPercent, currentTimeString } = useMemo(() => {
    if (!isToday) {
      return { currentTimePositionPercent: null, currentTimeString: null };
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const workStart = timeToMinutes(WORK_DAY_START); // 540
    const workEnd = timeToMinutes(WORK_DAY_END);     // 1080

    if (currentMinutes < workStart || currentMinutes > workEnd) {
      return { currentTimePositionPercent: null, currentTimeString: null };
    }

    const percent = ((currentMinutes - workStart) / (workEnd - workStart)) * 100;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return {
      currentTimePositionPercent: percent,
      currentTimeString: timeStr,
    };
  }, [isToday, now]);

  return (
    <TimelineView
      slots={slots}
      currentTimePositionPercent={currentTimePositionPercent}
      currentTimeString={currentTimeString}
      onSelectSlot={onSelectSlot}
      onEditBooking={onEditBooking}
      onDeleteBooking={onDeleteBooking}
    />
  );
};
