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
  const { todayStr, yesterdayStr, tomorrowStr } = useMemo(() => {
    const now = new Date();
    const today = formatDateIso(now);

    const yesterdayObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const tomorrowObj = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    return {
      todayStr: today,
      yesterdayStr: formatDateIso(yesterdayObj),
      tomorrowStr: formatDateIso(tomorrowObj),
    };
  }, []);

  const { formattedDate, relativeDateLabel, isToday } = useMemo(() => {
    const [year, month, day] = selectedDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);

    // Полное название даты для заголовка (например, "понедельник, 26 октября 2026")
    const fullFormatter = new Intl.DateTimeFormat('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    // Относительная надпись для кнопки между стрелками
    let label = '';
    if (selectedDate === yesterdayStr) {
      label = 'Вчера';
    } else if (selectedDate === todayStr) {
      label = 'Сегодня';
    } else if (selectedDate === tomorrowStr) {
      label = 'Завтра';
    } else {
      // В остальных случаях выводим саму дату: "28 окт."
      const shortFormatter = new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'short',
      });
      label = shortFormatter.format(dateObj);
    }

    return {
      formattedDate: fullFormatter.format(dateObj),
      relativeDateLabel: label,
      isToday: selectedDate === todayStr,
    };
  }, [selectedDate, todayStr, yesterdayStr, tomorrowStr]);

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

  const handleCenterButtonClick = () => {
    // Если мы на другой дате — быстрый возврат на "Сегодня"
    if (!isToday) {
      onDateChange(todayStr);
    }
  };

  return (
    <DateSelectorView
      rawDate={selectedDate}
      formattedDate={formattedDate}
      relativeDateLabel={relativeDateLabel}
      isToday={isToday}
      onPrevDay={handlePrevDay}
      onNextDay={handleNextDay}
      onToday={handleCenterButtonClick}
      onDateChange={onDateChange}
    />
  );
};
