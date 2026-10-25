import React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type DateSelectorViewProps = {
  formattedDate: string;
  relativeDateLabel: string;
  isToday: boolean;
  rawDate: string;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onDateChange: (newDate: string) => void;
};

export const DateSelectorView: React.FC<DateSelectorViewProps> = ({
  formattedDate,
  relativeDateLabel,
  isToday,
  rawDate,
  onPrevDay,
  onNextDay,
  onToday,
  onDateChange,
}) => {
  const dateInputRef = React.useRef<HTMLInputElement>(null);

  const handleOpenPicker = () => {
    try {
      dateInputRef.current?.showPicker();
    } catch {
      dateInputRef.current?.focus();
    }
  };

  return (
    <section
      aria-label="Выбор даты бронирования"
      className="flex flex-wrap items-center justify-between gap-4 p-4 md:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
          <CalendarDays className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Дата расписания
          </span>
          <h2 className="text-lg md:text-xl font-bold capitalize tracking-tight text-slate-900 dark:text-slate-100">
            {formattedDate}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevDay}
          aria-label="Предыдущий день"
          className="h-9 w-9 rounded-lg border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button
          variant={isToday ? 'default' : 'secondary'}
          size="sm"
          onClick={onToday}
          title={isToday ? 'Сегодня' : 'Нажмите, чтобы вернуться к Сегодня'}
          aria-label={`Выбранная дата: ${relativeDateLabel}. Нажмите для возврата к сегодняшнему дню`}
          className={`h-9 min-w-[5.5rem] px-3.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
            isToday
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700'
          }`}
        >
          {relativeDateLabel}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onNextDay}
          aria-label="Следующий день"
          className="h-9 w-9 rounded-lg border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Скрытый нативный инпут даты с кнопкой вызова календаря */}
        <div className="relative">
          <input
            ref={dateInputRef}
            type="date"
            value={rawDate}
            onChange={(e) => e.target.value && onDateChange(e.target.value)}
            className="sr-only"
            aria-label="Выбрать конкретную дату из календаря"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenPicker}
            aria-label="Открыть календарь"
            className="h-9 px-3 rounded-lg text-xs font-medium gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
            Календарь
          </Button>
        </div>
      </div>
    </section>
  );
};
