import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { startOfMonth, endOfMonth, format } from 'date-fns';

function useSchedules(departmentId: number | null, selectedDate: Date) {
  const currentStart = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
  const currentEnd = format(endOfMonth(selectedDate), 'yyyy-MM-dd');

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

  return {
    schedules: currentMonthData,
    isLoading,
    error,
    mutateSchedules: mutate,
  };
}

export default useSchedules;
