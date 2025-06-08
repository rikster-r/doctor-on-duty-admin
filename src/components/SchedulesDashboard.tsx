import Layout from '@/components/Layout';
import DoctorCombobox from './UserSelectCombobox';
import DefaultSchedulesControl from './DefaultSchedulesControl';

type Props = {
  doctors: User[];
  selectedDoctorId: number | null;
  setSelectedDoctorId: React.Dispatch<React.SetStateAction<number | null>>;
  defaultSchedules: DefaultSchedule[] | null;
  mutateDefaultSchedules: () => void;
  scheduleOverrides: ScheduleOverride[] | null;
  mutateScheduleOverrides: () => void;
  isLoading: boolean;
};

const ScheduleControlPage = ({
  doctors,
  selectedDoctorId,
  setSelectedDoctorId,
  defaultSchedules,
  mutateDefaultSchedules,
  isLoading,
}: Props) => {
  return (
    <Layout title="Панель графиков" description="Управление графиками врачей">
      <main className="p-4 max-w-[900px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row mb-2">
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

        {isLoading && <>Загрузка...</>}

        {defaultSchedules && selectedDoctorId && (
          <DefaultSchedulesControl
            defaultSchedules={defaultSchedules}
            selectedDoctorId={selectedDoctorId}
            mutateDefaultSchedules={mutateDefaultSchedules}
          />
        )}
      </main>
    </Layout>
  );
};

export default ScheduleControlPage;
