import SchedulesDashboard from '@/components/SchedulesDashboard';
import { GetServerSidePropsContext } from 'next';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { useEffect, useState } from 'react';
import useSchedules from '@/hooks/useSchedules';

export const getServerSideProps = (context: GetServerSidePropsContext) => {
  const authToken = context.req.cookies.authToken;
  if (!authToken) {
    return {
      redirect: {
        destination: '/login',
        permanent: true,
      },
    };
  }
  return {
    props: {
      initialDepartmentId:
        context.query.departmentId === undefined
          ? null
          : (context.query.departmentId as string),
    },
  };
};

type Props = {
  initialDepartmentId: string | null;
};

function Schedules({ initialDepartmentId }: Props) {
  const { data: departments, isLoading: isDepartmentsLoading } = useSWR<
    Department[]
  >('/api/departments', fetcher);

  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    number | null
  >(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (departments && departments.length > 0) {
      const initialId = Number(initialDepartmentId);
      const isValidId = departments.some((dept) => dept.id === initialId);
      if (initialDepartmentId && isValidId) {
        setSelectedDepartmentId(initialId);
      } else {
        setSelectedDepartmentId(departments[0].id);
      }
    }
  }, [departments, initialDepartmentId]);

  const {
    schedules,
    isLoading: isSchedulesLoading,
    mutateSchedules,
  } = useSchedules(selectedDepartmentId, selectedDate);
  const { data: doctors, isLoading: isDoctorsLoading } = useSWR<User[]>(
    `/api/departments/${selectedDepartmentId}/doctors`,
    fetcher
  );

  const isLoading =
    isSchedulesLoading || isDepartmentsLoading || isDoctorsLoading;

  return (
    <SchedulesDashboard
      doctors={doctors ?? []}
      departments={departments}
      selectedDepartmentId={selectedDepartmentId}
      setSelectedDepartmentId={setSelectedDepartmentId}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      schedules={schedules}
      mutateSchedules={mutateSchedules}
      isLoading={isLoading}
    />
  );
}

export default Schedules;
