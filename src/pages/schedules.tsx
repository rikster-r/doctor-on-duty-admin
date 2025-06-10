import SchedulesDashboard from '@/components/SchedulesDashboard';
import { GetServerSidePropsContext } from 'next';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { useEffect, useState } from 'react';

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
      initialDoctorId:
        context.query.doctorId === undefined
          ? null
          : (context.query.doctorId as string),
    },
  };
};

type Props = {
  initialDoctorId: string | null;
};

function Users({ initialDoctorId }: Props) {
  const { data: doctors, isLoading: isDoctorsLoading } = useSWR<User[]>(
    `/api/doctors`,
    fetcher
  );

  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);

  useEffect(() => {
    if (doctors && doctors.length > 0) {
      const initialId = Number(initialDoctorId);
      const isValidId = doctors.some((doc) => doc.id === initialId);

      if (initialDoctorId && isValidId) {
        setSelectedDoctorId(initialId);
      } else {
        setSelectedDoctorId(doctors[0].id);
      }
    }
  }, [doctors, initialDoctorId]);

  const {
    data: defaultSchedules,
    mutate: mutateDefaultSchedules,
    isLoading: isDefaultsLoading,
  } = useSWR(
    selectedDoctorId
      ? `/api/doctors/${selectedDoctorId}/schedules/defaults`
      : null,
    fetcher
  );
  const {
    data: scheduleOverrides,
    mutate: mutateScheduleOverrides,
    isLoading: isOverridesLoading,
  } = useSWR(
    selectedDoctorId
      ? `/api/doctors/${selectedDoctorId}/schedules/overrides`
      : null,
    fetcher
  );

  const isLoading = isDefaultsLoading || isOverridesLoading || isDoctorsLoading;

  return (
    <SchedulesDashboard
      doctors={doctors}
      selectedDoctorId={selectedDoctorId}
      setSelectedDoctorId={setSelectedDoctorId}
      defaultSchedules={defaultSchedules}
      mutateDefaultSchedules={mutateDefaultSchedules}
      scheduleOverrides={scheduleOverrides}
      mutateScheduleOverrides={mutateScheduleOverrides}
      isLoading={isLoading}
    />
  );
}

export default Users;
