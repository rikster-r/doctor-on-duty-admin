import { eachDayOfInterval } from 'date-fns';

export const isSameDate = (d1: Date, d2: Date) =>
  d1.toLocaleDateString('en-CA') === d2.toLocaleDateString('en-CA');

export const getDateRange = (startDate: Date, endDate: Date): Date[] => {
  const start = startDate < endDate ? startDate : endDate;
  const end = startDate > endDate ? startDate : endDate;
  return eachDayOfInterval({ start, end });
};

// generate 6*7 grid based on currentDate's month
export const getCalendarDays = (currentDate: Date) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);

  // Adjust to start from Monday
  const dayOfWeek = (firstDay.getDay() + 6) % 7;
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const days = [];
  const current = new Date(startDate);

  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
};

export const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
export const monthNames = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];
