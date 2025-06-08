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
    props: {},
  };
};

function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: doctors, isLoading: isDoctorsLoading } = useSWR(
    `/api/doctors?search=${encodeURIComponent(searchTerm)}`,
    fetcher
  );
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(
    doctors?.[0]?.id || null
  );

  const { data: defaultSchedules, isLoading: isDefaultsLoading } = useSWR(
    selectedDoctorId
      ? `/api/doctors/${selectedDoctorId}/schedules/defaults`
      : null,
    fetcher
  );
  const { data: scheduleOverrides, isLoading: isOverridesLoading } = useSWR(
    selectedDoctorId
      ? `/api/doctors/${selectedDoctorId}/schedules/overrides`
      : null,
    fetcher
  );

  useEffect(() => {
    if (doctors && doctors.length > 0) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors]);

  const isLoading = isDefaultsLoading || isOverridesLoading || isDoctorsLoading;

  return (
    <SchedulesDashboard
      doctors={doctors}
      selectedDoctorId={selectedDoctorId}
      setSelectedDoctorId={setSelectedDoctorId}
      defaultSchedules={defaultSchedules}
      scheduleOverrides={scheduleOverrides}
      isLoading={isLoading}
    />
  );
}

export default Users;
