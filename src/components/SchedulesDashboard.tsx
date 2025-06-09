import React, { useState } from 'react';
import Layout from '@/components/Layout';
import DoctorCombobox from './UserSelectCombobox';
import DefaultSchedulesControl from './DefaultSchedulesControl';
import ScheduleCalendar from './ScheduleCalendar';

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
  scheduleOverrides,
  mutateScheduleOverrides,
  isLoading,
}: Props) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'schedules'>(
    'calendar'
  );

  return (
    <Layout title="Панель графиков" description="Управление графиками врачей">
      <main className="p-4 max-w-[1100px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row mb-6">
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

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'calendar'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Календарь
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'schedules'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Базовые графики
          </button>
        </div>

        {isLoading && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Загрузка...</p>
          </div>
        )}

        {!isLoading && (
          <>
            {activeTab === 'calendar' && (
              <div className="space-y-6">
                <ScheduleCalendar
                  selectedDoctorId={selectedDoctorId}
                  defaultSchedules={defaultSchedules}
                  scheduleOverrides={scheduleOverrides}
                  mutateScheduleOverrides={mutateScheduleOverrides}
                />
              </div>
            )}

            {activeTab === 'schedules' &&
              defaultSchedules &&
              selectedDoctorId && (
                <DefaultSchedulesControl
                  defaultSchedules={defaultSchedules}
                  selectedDoctorId={selectedDoctorId}
                  mutateDefaultSchedules={mutateDefaultSchedules}
                />
              )}
          </>
        )}
      </main>
    </Layout>
  );
};

export default ScheduleControlPage;
