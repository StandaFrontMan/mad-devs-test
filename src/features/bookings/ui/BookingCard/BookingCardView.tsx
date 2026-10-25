import React from 'react';
import { Pencil, Trash2, Clock } from 'lucide-react';
import type { Booking } from '@/domain/booking';
import { getDurationMinutes } from '@/domain/rules';

export type BookingCardViewProps = {
  booking: Booking;
  isPast?: boolean;
  onEdit?: (booking: Booking) => void;
  onDelete?: (booking: Booking) => void;
};

export const BookingCardView: React.FC<BookingCardViewProps> = ({
  booking,
  isPast = false,
  onEdit,
  onDelete,
}) => {
  const duration = getDurationMinutes(booking.start, booking.end);
  const durationLabel =
    duration >= 60
      ? `${Math.floor(duration / 60)} ч ${duration % 60 ? `${duration % 60} мин` : ''}`.trim()
      : `${duration} мин`;

  return (
    <article
      aria-label={`Бронирование: ${booking.title || 'Без названия'}, с ${booking.start} до ${booking.end}`}
      className={`group relative flex items-center justify-between w-full p-3 rounded-lg border transition-all ${
        isPast
          ? 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-900/60 dark:border-slate-800'
          : 'bg-blue-50/90 hover:bg-blue-100/70 border-l-4 border-l-blue-600 border-y border-r border-blue-200/80 text-blue-950 shadow-xs dark:bg-blue-950/40 dark:border-l-blue-500 dark:border-blue-800 dark:text-blue-100'
      }`}
    >
      <div className="flex flex-col gap-1 min-w-0 pr-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm truncate tracking-tight text-slate-900 dark:text-slate-100">
            {booking.title?.trim() || 'Встреча в переговорной'}
          </h3>
          {isPast && (
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Завершено
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1 font-mono font-medium text-blue-700 dark:text-blue-400">
            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {booking.start} — {booking.end}
          </span>
          <span>•</span>
          <span>{durationLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(booking);
            }}
            aria-label={`Редактировать бронирование: ${booking.title || 'Встреча'}`}
            className="p-1.5 rounded-md hover:bg-white/80 dark:hover:bg-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 outline-hidden cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(booking);
            }}
            aria-label={`Удалить бронирование: ${booking.title || 'Встреча'}`}
            className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-950/60 text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors focus-visible:ring-2 focus-visible:ring-red-500 outline-hidden cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </article>
  );
};
