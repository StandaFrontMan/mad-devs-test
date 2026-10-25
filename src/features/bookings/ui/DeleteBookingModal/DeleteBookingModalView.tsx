import React from 'react';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Booking } from '@/domain/booking';

export type DeleteBookingModalViewProps = {
  isOpen: boolean;
  booking: Booking | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export const DeleteBookingModalView: React.FC<DeleteBookingModalViewProps> = ({
  isOpen,
  booking,
  isDeleting,
  onConfirm,
  onClose,
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 relative flex flex-col gap-4 text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 id="delete-dialog-title" className="text-base font-bold tracking-tight">
              Удалить бронирование?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Это действие нельзя будет отменить.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs flex flex-col gap-1">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {booking.title?.trim() || 'Встреча в переговорной'}
          </span>
          <span className="font-mono text-slate-500 dark:text-slate-400">
            {booking.date} • {booking.start} — {booking.end}
          </span>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="h-9 px-4 rounded-lg cursor-pointer"
          >
            Отмена
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-9 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold gap-2 shadow-xs cursor-pointer"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>{isDeleting ? 'Удаление...' : 'Удалить'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
