import React from 'react';
import { X, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type BookingFormModalViewProps = {
  isOpen: boolean;
  mode: 'create' | 'edit';
  title: string;
  start: string;
  end: string;
  date: string;
  startOptions: string[];
  endOptions: string[];
  durationLabel: string;
  isDurationValid: boolean;
  validationError: string | null;
  serverError: string | null;
  isSubmitting: boolean;
  onTitleChange: (value: string) => void;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
};

export const BookingFormModalView: React.FC<BookingFormModalViewProps> = ({
  isOpen,
  mode,
  title,
  start,
  end,
  date,
  startOptions,
  endOptions,
  durationLabel,
  isDurationValid,
  validationError,
  serverError,
  isSubmitting,
  onTitleChange,
  onStartChange,
  onEndChange,
  onSubmit,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 relative flex flex-col gap-5 text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка модалки */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 id="booking-form-title" className="text-lg font-bold tracking-tight">
              {mode === 'create' ? 'Новое бронирование' : 'Редактирование бронирования'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Дата: <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{date}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть окно"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Баннер серверной ошибки (409 Conflict или валидация) */}
        {serverError && (
          <div
            role="alert"
            className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 shadow-2xs"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Конфликт времени</p>
              <p className="mt-0.5 leading-relaxed">{serverError}</p>
            </div>
          </div>
        )}

        {/* Форма */}
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {/* Название */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="booking-title" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Тема встречи (опционально)
            </label>
            <input
              id="booking-title"
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Например: Синхронизация команды разработки"
              maxLength={80}
              className="w-full h-10 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Интервал времени */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="booking-start" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Время начала
              </label>
              <select
                id="booking-start"
                value={start}
                onChange={(e) => onStartChange(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition-all cursor-pointer"
              >
                {startOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="booking-end" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Время окончания
              </label>
              <select
                id="booking-end"
                value={end}
                onChange={(e) => onEndChange(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition-all cursor-pointer"
              >
                {endOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Индикатор длительности */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Длительность:</span>
            </div>
            <span
              className={`font-semibold font-mono px-2 py-0.5 rounded text-xs ${
                isDurationValid
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
              }`}
            >
              {durationLabel}
            </span>
          </div>

          {/* Клиентская ошибка валидации */}
          {validationError && (
            <p className="text-xs font-medium text-red-600 dark:text-red-400 -mt-1">
              {validationError}
            </p>
          )}

          {/* Кнопки действий */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 rounded-lg cursor-pointer"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={!isDurationValid || !!validationError || isSubmitting}
              className="h-10 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 shadow-xs cursor-pointer"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{mode === 'create' ? 'Забронировать' : 'Сохранить изменения'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
