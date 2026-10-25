import React, { useMemo } from 'react';
import { DateSelectorView } from './DateSelectorView';
import { formatDateIso } from '@/domain/time';

export type DateSelectorContainerProps = {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (newDate: string) => void;
};

export const DateSelectorContainer: React.FC<DateSelectorContainerProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const todayStr = useMemo(() => formatDateIso(new Date()), []);

  const { formattedDate, isToday } = useMemo(() => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);

    const formatter = new Intl.DateTimeFormat('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return {
      formattedDate: formatter.format(dateObj),
      isToday: selectedDate === todayStr,
    };
  }, [selectedDate, todayStr]);

  const handlePrevDay = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day - 1);
    onDateChange(formatDateIso(dateObj));
  };

  const handleNextDay = () => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day + 1);
    onDateChange(formatDateIso(dateObj));
  };

  const handleToday = () => {
    onDateChange(todayStr);
  };

  return (
    <DateSelectorView
      rawDate={selectedDate}
      formattedDate={formattedDate}
      isToday={isToday}
      onPrevDay={handlePrevDay}
      onNextDay={handleNextDay}
      onToday={handleToday}
      onDateChange={onDateChange}
    />
  );
};
