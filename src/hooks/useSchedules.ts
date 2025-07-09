import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  addMonths,
  format,
} from 'date-fns';

function useSchedules(departmentId: number | null, selectedDate: Date) {
  const currentStart = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
  const currentEnd = format(endOfMonth(selectedDate), 'yyyy-MM-dd');

  const prevStart = format(
    startOfMonth(subMonths(selectedDate, 1)),
    'yyyy-MM-dd'
  );
  const nextEnd = format(endOfMonth(addMonths(selectedDate, 1)), 'yyyy-MM-dd');

  const shouldFetch = departmentId !== null;

  // Main current month fetch
  const {
    data: currentMonthData,
    error,
    isLoading,
    mutate,
  } = useSWR<DepartmentDateSchedule[]>(
    shouldFetch
      ? `/api/departments/${departmentId}/schedules?start=${currentStart}&end=${currentEnd}`
      : null,
    fetcher
  );

  // Prefetch previous and next months (fire-and-forget)
  useSWR(
    shouldFetch
      ? `/api/departments/${departmentId}/schedules?start=${prevStart}&end=${currentEnd}`
      : null,
    fetcher,
    { revalidateOnFocus: false, revalidateIfStale: false }
  );

  useSWR(
    shouldFetch
      ? `/api/departments/${departmentId}/schedules?start=${currentStart}&end=${nextEnd}`
      : null,
    fetcher,
    { revalidateOnFocus: false, revalidateIfStale: false }
  );

  return {
    schedules: currentMonthData,
    isLoading,
    error,
    mutateSchedules: mutate,
  };
}

export default useSchedules;
