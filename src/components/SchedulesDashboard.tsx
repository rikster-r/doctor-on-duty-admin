import Layout from '@/components/Layout';
import DoctorCombobox from './UserSelectCombobox';

type User = {
  id: number;
  phone_number: string;
  first_name: string;
  last_name: string;
  password_hash: string;
  role: string;
  created_at: string;
  photo_url: string;
  doctor_data?: {
    specialization: string;
    department: { id: number; name: string };
  };
};

type Props = {
  doctors: User[];
  selectedDoctorId: number | null;
  setSelectedDoctorId: React.Dispatch<React.SetStateAction<number | null>>;
  defaultSchedules: DefaultSchedule[] | null;
  scheduleOverrides: ScheduleOverride[] | null;
  isLoading: boolean;
};

const ScheduleControlPage = ({
  doctors,
  selectedDoctorId,
  setSelectedDoctorId,
  defaultSchedules,
  scheduleOverrides,
  isLoading,
}: Props) => {
  return (
    <Layout title="Панель графиков" description="Управление графиками врачей">
      <div className="flex flex-col sm:flex-row p-4 mb-2 max-w-[800px] mx-auto w-full">
        <div className="mb-4 mr-4 sm:mb-0 sm:mr-auto">
          <h1 className="text-lg font-semibold">Панель графиков</h1>
          <p className="text-gray-500 text-sm">
            Создание и редактирование графиков работы врачей
          </p>
        </div>

        <DoctorCombobox
          doctors={doctors}
          selectedDoctorId={selectedDoctorId}
          onDoctorChange={setSelectedDoctorId}
          isLoading={isLoading}
          placeholder="Загрузка..."
        />
      </div>
    </Layout>
  );
};

export default ScheduleControlPage;
