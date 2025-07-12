import Layout from '@/components/Layout';
import DepartmentCombobox from './DepartmentCombobox';
import ScheduleCalendar from './ScheduleCalendar';
import { KeyedMutator } from 'swr';

type Props = {
  doctors: User[];
  departments: Department[] | undefined;
  selectedDepartmentId: number | null;
  setSelectedDepartmentId: (id: number | null) => void;
  schedules: DepartmentDateSchedule[] | undefined;
  mutateSchedules: KeyedMutator<DepartmentDateSchedule[]>;
  holidays: Holiday[];
  mutateHolidays: KeyedMutator<Holiday[]>;
  isPageLoading: boolean;
  isCalendarLoading: boolean;
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
};

const ScheduleControlPage = ({
  doctors,
  departments,
  selectedDepartmentId,
  setSelectedDepartmentId,
  schedules,
  mutateSchedules,
  holidays,
  mutateHolidays,
  isPageLoading,
  isCalendarLoading,
  selectedDate,
  setSelectedDate,
}: Props) => {
  return (
    <Layout
      title="Панель графиков | Дежурный доктор"
      description="Управление графиками врачей"
    >
      <main className={`max-w-[1100px] p-4 mx-auto w-full`}>
        <div className="flex flex-col sm:flex-row mb-6">
          <div className="mb-4 mr-4 sm:mb-0 sm:mr-auto">
            <h1 className="text-lg font-semibold">Панель графиков</h1>
            <p className="text-gray-500 text-sm">
              Создание и редактирование графиков работы врачей
            </p>
          </div>
          <DepartmentCombobox
            departments={departments}
            selectedDepartmentId={selectedDepartmentId}
            onDepartmentChange={setSelectedDepartmentId}
            isLoading={isPageLoading}
            placeholder="Загрузка..."
          />
        </div>

        <div className="space-y-6">
          <ScheduleCalendar
            doctors={doctors}
            selectedDepartmentId={selectedDepartmentId}
            schedules={schedules}
            mutateSchedules={mutateSchedules}
            holidays={holidays}
            mutateHolidays={mutateHolidays}
            currentDate={selectedDate}
            setCurrentDate={setSelectedDate}
            isCalendarLoading={isCalendarLoading}
          />
        </div>
      </main>
    </Layout>
  );
};

export default ScheduleControlPage;
