import React, { useState, useMemo } from 'react';
import {
  CaretLeft,
  CaretRight,
  Clock,
  PencilSimple,
  ArrowUUpLeft,
  CalendarX,
} from 'phosphor-react';
import { Popover, PopoverPanel, PopoverButton, CloseButton } from '@headlessui/react';
import AddScheduleOverrideModal from './modals/AddScheduleOverrideModal';
import { toast } from 'react-toastify';

type Props = {
  selectedDoctorId: number | null;
  defaultSchedules: DefaultSchedule[] | null;
  scheduleOverrides: ScheduleOverride[] | null;
  mutateScheduleOverrides: () => void;
  onCreateOverride?: (
    override: Omit<ScheduleOverride, 'id' | 'created_at'>
  ) => Promise<void>;
  onUpdateOverride?: (
    id: number,
    override: Partial<ScheduleOverride>
  ) => Promise<void>;
  onDeleteOverride?: (id: number) => Promise<void>;
};

type ScheduleInfo = {
  type: 'default' | 'override' | 'none';
  schedule: DefaultSchedule | ScheduleOverride | null;
  hasSchedule: boolean;
};

const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const monthNames = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];
const dayOfWeekMap = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

const ScheduleCalendar: React.FC<Props> = ({
  selectedDoctorId,
  defaultSchedules,
  scheduleOverrides,
  mutateScheduleOverrides,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);

    // Adjust to start from Monday
    const dayOfWeek = (firstDay.getDay() + 6) % 7;
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentDate]);

  // Get schedule for a specific date
  const getScheduleForDate = (date: Date): ScheduleInfo => {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = (date.getDay() + 6) % 7; // Convert to Monday = 0

    // Check for override first
    const override = scheduleOverrides?.find(
      (o) => o.date === dateStr && o.user_id === selectedDoctorId
    );

    if (override) {
      return {
        type: 'override' as const,
        schedule: override,
        hasSchedule: true,
      };
    }

    // Check default schedule
    const dayName = (
      Object.keys(dayOfWeekMap) as Array<keyof typeof dayOfWeekMap>
    ).find((key) => dayOfWeekMap[key] === dayOfWeek);
    const defaultSchedule = defaultSchedules?.find(
      (s) => s.day_of_week === dayName && s.user_id === selectedDoctorId
    );

    if (defaultSchedule) {
      return {
        type: 'default' as const,
        schedule: defaultSchedule,
        hasSchedule: !defaultSchedule.is_day_off,
      };
    }

    return {
      type: 'none' as const,
      schedule: null,
      hasSchedule: false,
    };
  };

  const getClassFromScheduleInfo = (scheduleInfo: ScheduleInfo) => {
    if (!scheduleInfo.schedule) return '';

    if (scheduleInfo.type === 'override') {
      return 'bg-orange-100 text-orange-700';
    }

    if (
      'is_day_off' in scheduleInfo.schedule &&
      scheduleInfo.schedule.is_day_off
    ) {
      return 'bg-gray-100 text-gray-700';
    }

    if (scheduleInfo.type === 'default') {
      return 'bg-blue-100 text-blue-700';
    }

    return '';
  };

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
  };

  const handleDeleteOverride = async (scheduleId: number) => {
    try {
      const res = await fetch(
        `/api/doctors/${selectedDoctorId}/schedules/overrides/${scheduleId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        mutateScheduleOverrides();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Ошибка при удалении графика');
      }
    } catch (error) {
      console.error('Ошибка при удалении графика:', error);
    }
  };

  const handleSetVacation = async (date: Date) => {
    try {
      const res = await fetch(
        `/api/doctors/${selectedDoctorId}/schedules/overrides`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date,
            is_day_off: true,
          }),
        }
      );
      if (res.ok) {
        mutateScheduleOverrides();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Ошибка при изменении графика');
      }
    } catch (error) {
      console.error('Ошибка при изменении графика:', error);
    }
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  if (!selectedDoctorId) {
    return <></>;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Calendar Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <CaretLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <CaretRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Legend */}
          <div>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded-full"></div>
                <span>Базовый</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded-full"></div>
                <span>Изменение графика</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-full"></div>
                <span>Выходной</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const isToday = date.toDateString() === new Date().toDateString();
              const scheduleInfo = getScheduleForDate(date);
              const scheduleClasses = getClassFromScheduleInfo(scheduleInfo);

              return (
                <Popover key={index} className="">
                  <PopoverButton
                    onClick={() => handleDateClick(date)}
                    className={`
                  w-full p-3 h-20 rounded-lg text-left transition-all duration-200 relative  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                  ${
                    !isCurrentMonth
                      ? 'text-gray-300 bg-gray-50 hover:bg-gray-100'
                      : 'text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                  }
                  ${
                    isToday
                      ? 'border-blue-400 bg-blue-50 hover:bg-blue-100'
                      : ''
                  }
                `}
                  >
                    <div className="font-medium text-sm mb-1 ">
                      {date.getDate()}
                    </div>

                    {isCurrentMonth && scheduleInfo.schedule && (
                      <div className="text-xs space-y-1">
                        <div
                          className={`${scheduleClasses} py-0.5 px-2 flex items-center space-x-1 text-gray-600 text-xs rounded-full`}
                        >
                          {scheduleInfo.schedule.is_day_off ? (
                            <div className="px-2 py-0.5 rounded-full text-xs font-medium">
                              Выходной
                            </div>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">
                                {formatTime(scheduleInfo.schedule.start_time)}-
                                {formatTime(scheduleInfo.schedule.end_time)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </PopoverButton>
                  <PopoverPanel
                    className="absolute z-10 mt-1 w-60 rounded-lg shadow-lg bg-white border border-gray-300 overflow-hidden ring-1 ring-black ring-opacity-5"
                    anchor={{
                      to: 'bottom start',
                      gap: 0,
                    }}
                  >
                    <div className="p-2 space-y-1">
                      <CloseButton
                        onClick={() => {
                          setShowOverrideModal(true);
                        }}
                        className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        <PencilSimple className="w-4 h-4" />
                        <span>Изменить график</span>
                      </CloseButton>

                      {!scheduleInfo.schedule?.is_day_off && (
                        <CloseButton
                          onClick={() => {
                            handleSetVacation(date);
                          }}
                          className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                          <CalendarX className="w-4 h-4" />
                          <span>Установить выходной</span>
                        </CloseButton>
                      )}

                      {scheduleInfo.type === 'override' && (
                        <CloseButton
                          onClick={() => {
                            if (!scheduleInfo.schedule) return;
                            handleDeleteOverride(scheduleInfo.schedule.id);
                          }}
                          className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        >
                          <ArrowUUpLeft className="w-4 h-4" />
                          <span>Вернуть базовый график</span>
                        </CloseButton>
                      )}
                    </div>
                  </PopoverPanel>
                </Popover>
              );
            })}
          </div>
        </div>
      </div>
      {showOverrideModal && selectedDate && (
        <AddScheduleOverrideModal
          isOpen={showOverrideModal}
          setIsOpen={setShowOverrideModal}
          doctorId={selectedDoctorId}
          date={selectedDate}
          onOverrideAdded={mutateScheduleOverrides}
        />
      )}
    </>
  );
};

export default ScheduleCalendar;
