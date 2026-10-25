import React from 'react';
import { Plus, Ban } from 'lucide-react';
import type { TimelineSlot } from '../../model/types';
import { BookingCardView } from '../BookingCard/BookingCardView';
import type { Booking } from '@/domain/booking';

export type SlotRowViewProps = {
  slot: TimelineSlot;
  onSelectSlot?: (startTime: string) => void;
  onEditBooking?: (booking: Booking) => void;
  onDeleteBooking?: (booking: Booking) => void;
};

export const SlotRowView: React.FC<SlotRowViewProps> = ({
  slot,
  onSelectSlot,
  onEditBooking,
  onDeleteBooking,
}) => {
  const { start, end, status, booking, isFirstSlotOfBooking } = slot;

  // Если это занятый слот
  if (status === 'busy' && booking) {
    if (isFirstSlotOfBooking) {
      return (
        <div className="relative py-0.5">
          <BookingCardView
            booking={booking}
            onEdit={onEditBooking}
            onDelete={onDeleteBooking}
          />
        </div>
      );
    }
    // Если это продолжение брони (2-й, 3-й слот)
    return (
      <div
        aria-hidden="true"
        className="h-9 -mt-1 rounded-b-lg border-l-4 border-l-blue-600 border-r border-b border-blue-200/70 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800/60 flex items-center px-3"
      >
        <span className="text-[11px] text-blue-700/70 dark:text-blue-300/70 italic font-mono">
          Продолжение встречи ({start}–{end})
        </span>
      </div>
    );
  }

  // Если слот в прошлом
  if (status === 'past') {
    return (
      <button
        type="button"
        disabled
        aria-label={`Слот ${start}–${end} недоступен, время прошло`}
        aria-disabled="true"
        className="group relative flex items-center justify-between w-full h-11 px-3.5 rounded-lg border border-dashed border-slate-200 bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/40 text-slate-400 select-none cursor-not-allowed text-left transition-all"
      >
        <div className="flex items-center gap-2 text-xs">
          <Ban className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          <span>Прошедшее время</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">{start}–{end}</span>
      </button>
    );
  }

  // Свободный слот для бронирования
  return (
    <button
      type="button"
      onClick={() => onSelectSlot?.(start)}
      aria-label={`Свободно для бронирования с ${start} до ${end}. Нажмите, чтобы забронировать.`}
      className="group relative flex items-center justify-between w-full h-11 px-3.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 outline-hidden cursor-pointer text-left shadow-2xs"
    >
      <div className="flex items-center gap-2 text-xs font-medium">
        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
        </div>
        <span>Свободно</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {start}–{end}
        </span>
        <span className="text-[11px] font-semibold hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 dark:text-blue-400">
          Забронировать →
        </span>
      </div>
    </button>
  );
};
