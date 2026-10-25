import React from 'react';
import type { TimelineSlot } from '../../model/types';
import { SlotRowView } from './SlotRowView';
import type { Booking } from '@/domain/booking';

export type TimelineViewProps = {
  slots: TimelineSlot[];
  currentTimePositionPercent: number | null;
  currentTimeString: string | null;
  onSelectSlot?: (startTime: string) => void;
  onEditBooking?: (booking: Booking) => void;
  onDeleteBooking?: (booking: Booking) => void;
};

export const TimelineView: React.FC<TimelineViewProps> = ({
  slots,
  currentTimePositionPercent,
  currentTimeString,
  onSelectSlot,
  onEditBooking,
  onDeleteBooking,
}) => {
  return (
    <section
      role="region"
      aria-label="Сетка рабочего дня переговорной комнаты (09:00–18:00)"
      className="relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:p-6 shadow-xs"
    >
      <div className="relative flex flex-col gap-2">
        {/* Индикатор текущей линии времени ("Сейчас") */}
        {currentTimePositionPercent !== null && (
          <div
            style={{ top: `${currentTimePositionPercent}%` }}
            className="absolute left-0 right-0 z-20 pointer-events-none flex items-center -translate-y-1/2"
            aria-hidden="true"
          >
            <div className="flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>Сейчас {currentTimeString}</span>
            </div>
            <div className="flex-1 h-[2px] bg-red-500 shadow-xs" />
          </div>
        )}

        {/* Список 30-минутных слотов */}
        <div className="flex flex-col gap-2">
          {slots.map((slot) => (
            <div key={`${slot.start}-${slot.end}`} className="flex items-start gap-3 sm:gap-4">
              {/* Левая колонка со временем */}
              <div className="w-12 sm:w-14 pt-2.5 text-right font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 select-none shrink-0">
                {slot.start}
              </div>

              {/* Правая интерактивная строка слота */}
              <div className="flex-1 min-w-0">
                <SlotRowView
                  slot={slot}
                  onSelectSlot={onSelectSlot}
                  onEditBooking={onEditBooking}
                  onDeleteBooking={onDeleteBooking}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
