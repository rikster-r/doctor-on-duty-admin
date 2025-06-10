import { useState } from 'react';
import { Plus, X, Moon, Clock, PencilSimple } from 'phosphor-react';
import {
  Popover,
  PopoverPanel,
  PopoverButton,
  CloseButton,
} from '@headlessui/react';
import { toast } from 'react-toastify';
import AddDefaultScheduleModal from './modals/AddDefaultScheduleModal';

type Props = {
  defaultSchedules: DefaultSchedule[];
  selectedDoctorId: number;
  mutateDefaultSchedules: () => void;
};

const daysOfWeek = [
  { id: 'monday', text: 'Понедельник', short: 'Пн' },
  { id: 'tuesday', text: 'Вторник', short: 'Вт' },
  { id: 'wednesday', text: 'Среда', short: 'Ср' },
  { id: 'thursday', text: 'Четверг', short: 'Чт' },
  { id: 'friday', text: 'Пятница', short: 'Пт' },
  { id: 'saturday', text: 'Суббота', short: 'Сб' },
  { id: 'sunday', text: 'Воскресенье', short: 'Вс' },
];

export default function DefaultSchedulesGrid({
  defaultSchedules,
  selectedDoctorId,
  mutateDefaultSchedules,
}: Props) {
  const [addDefaultScheduleModalOpen, setAddDefaultScheduleModalOpen] =
    useState(false);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string | null>(
    null
  );

  const deleteDefaultSchedule = async (scheduleId: number) => {
    try {
      const res = await fetch(
        `/api/doctors/${selectedDoctorId}/schedules/defaults/${scheduleId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        mutateDefaultSchedules();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Ошибка при удалении графика');
      }
    } catch (error) {
      console.error('Ошибка при удалении графика:', error);
    }
  };

  const setDayOff = async (dayOfWeek: string) => {
    try {
      const res = await fetch(
        `/api/doctors/${selectedDoctorId}/schedules/defaults`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            day_of_week: dayOfWeek,
            is_day_off: true,
          }),
        }
      );

      if (res.ok) {
        mutateDefaultSchedules();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Ошибка при установке выходного дня');
      }
    } catch (error) {
      console.error('Ошибка при установке выходного:', error);
    }
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Базовый график работы
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Настройте стандартное расписание для каждого дня недели
          </p>
        </div>

        {/* Schedule Grid */}
        <div className="p-4 sm:p-6">
          <div className="space-y-3">
            {daysOfWeek.map((day) => {
              const schedule = defaultSchedules.find(
                (s) => s.day_of_week === day.id
              );

              return (
                <div
                  key={day.id}
                  className="flex items-center justify-between px-3 py-4 sm:p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  {/* Day Name */}
                  <div className="flex items-center space-x-1 sm:space-x-3 min-w-0 flex-1">
                    <div className="w-8 h-8 bg-gray-100 aspect-square rounded-full flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-medium text-gray-600">
                        {day.short}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm sm:text-base font-medium text-gray-900">
                        {day.text}
                      </div>
                    </div>
                  </div>

                  {/* Schedule Info */}
                  <div className="flex items-center space-x-3">
                    {schedule ? (
                      <Popover className="relative">
                        <PopoverButton
                          className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                            schedule.is_day_off
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-500'
                          }`}
                        >
                          {schedule.is_day_off ? (
                            <div className="flex items-center space-x-2">
                              <Moon className="w-4 h-4" />
                              <span>Выходной</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>
                                {formatTime(schedule.start_time)} -{' '}
                                {formatTime(schedule.end_time)}
                              </span>
                            </div>
                          )}
                        </PopoverButton>

                        <PopoverPanel
                          className="absolute z-10 mt-1 w-60 rounded-lg shadow-lg bg-white border border-gray-300 overflow-hidden ring-1 ring-black ring-opacity-5"
                          anchor={{
                            to: 'bottom end',
                            gap: 8,
                          }}
                        >
                          <div className="p-2 space-y-1">
                            <CloseButton
                              onClick={() => {
                                setSelectedDayOfWeek(day.id);
                                setAddDefaultScheduleModalOpen(true);
                              }}
                              className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                            >
                              <PencilSimple className="w-4 h-4" />
                              <span>Изменить график</span>
                            </CloseButton>

                            {!schedule.is_day_off && (
                              <CloseButton
                                onClick={() => setDayOff(day.id)}
                                className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                              >
                                <Moon className="w-4 h-4" />
                                <span>Сделать выходным</span>
                              </CloseButton>
                            )}

                            <CloseButton
                              onClick={() => deleteDefaultSchedule(schedule.id)}
                              className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                            >
                              <X className="w-4 h-4" />
                              <span>Удалить график</span>
                            </CloseButton>
                          </div>
                        </PopoverPanel>
                      </Popover>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedDayOfWeek(day.id);
                            setAddDefaultScheduleModalOpen(true);
                          }}
                          className="text-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 flex items-center text-gray-500 hover:text-blue-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                          title="Добавить базовый график"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-sm font-medium hidden sm:block sm:ml-2">
                            Добавить время
                          </span>
                        </button>

                        <button
                          onClick={() => setDayOff(day.id)}
                          className="px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 flex items-center text-gray-500 hover:text-gray-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                          title="Выходной день"
                        >
                          <Moon className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {addDefaultScheduleModalOpen && selectedDayOfWeek && (
        <AddDefaultScheduleModal
          isOpen={addDefaultScheduleModalOpen}
          setIsOpen={setAddDefaultScheduleModalOpen}
          doctorId={selectedDoctorId}
          dayOfWeek={selectedDayOfWeek}
          onScheduleAdded={mutateDefaultSchedules}
        />
      )}
    </>
  );
}
