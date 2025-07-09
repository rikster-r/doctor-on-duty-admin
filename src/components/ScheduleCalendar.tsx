import React, { useEffect, useMemo, useState } from 'react';
import { CaretLeft, CaretRight } from 'phosphor-react';
import type { KeyedMutator } from 'swr';
import SchedulePopoverPanel from './ScheduleUsersPopover';

type Props = {
  doctors: User[];
  selectedDepartmentId: number | null;
  schedules: DepartmentDateSchedule[] | undefined;
  mutateSchedules: KeyedMutator<DepartmentDateSchedule[]>;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
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

const DepartmentScheduleCalendar: React.FC<Props> = ({
  doctors,
  selectedDepartmentId,
  schedules,
  // mutateSchedules,
  currentDate,
  setCurrentDate,
}) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [openPanelInfo, setOpenPanelInfo] = useState<{
    referenceElement: HTMLElement;
    users: UserWithSchedule[];
  } | null>(null);

  const handleDayClick = (
    referenceElement: HTMLElement,
    date: Date,
    users: UserWithSchedule[]
  ) => {
    if (selectedDates.some((d) => d.getTime() === date.getTime())) {
      setSelectedDates((dates) =>
        dates.filter((d) => d.getTime() !== date.getTime())
      );
      setOpenPanelInfo(null);
    } else {
      setSelectedDates([date]);
      setOpenPanelInfo({
        referenceElement,
        users,
      });
    }
  };

  useEffect(() => {
    setSelectedDates([]);
    setOpenPanelInfo(null);
  }, [selectedDepartmentId, currentDate]);

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
  const getScheduleForDate = (date: Date): UserWithSchedule[] => {
    const dateStr = date.toLocaleDateString('en-CA');
    const daySchedule = schedules?.find(
      (schedule) => schedule.date === dateStr
    );
    return daySchedule?.users || [];
  };

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  if (!selectedDepartmentId) {
    return <></>;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md">
        {/* Calendar Header */}
        <div className="px-2 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <CaretLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 w-[150px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <CaretRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-evenly space-x-3 sm:space-x-6 text-xs sm:text-sm text-gray-600 mt-4 sm:mt-0">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded-full"></div>
              <span className="w-max">Рабочий день</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-full"></div>
              <span className="w-max">Выходной</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-1 sm:p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-1 text-center text-sm font-medium text-gray-500"
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
              const dayUsers = getScheduleForDate(date);
              const hasUsers = dayUsers.length > 0;

              return (
                <button
                  key={index}
                  className={`
                    h-full w-full p-1 lg:p-3 min-h-20 rounded-lg text-left transition-all duration-200 relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
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
                  onClick={(e) =>
                    handleDayClick(e.currentTarget, date, dayUsers)
                  }
                >
                  <div className="font-medium text-sm mb-auto">
                    {date.getDate()}
                  </div>

                  <div className="text-xs space-y-1 min-h-[48px] sm:min-h-[20px]">
                    {hasUsers && (
                      <div className="space-y-1">
                        {/* Working doctors */}
                        {dayUsers.map((user) => (
                          <div key={user.id}>
                            {user.schedule && (
                              <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 py-0.5 px-1 sm:px-2 rounded-md">
                                <span className="font-semibold text-blue-800 truncate">
                                  {user.last_name} {user.first_name.slice(0, 1)}
                                  .
                                  {user.middle_name
                                    ? `${user.middle_name.slice(0, 1)}.`
                                    : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {openPanelInfo && (
        <SchedulePopoverPanel
          dates={selectedDates}
          dayUsers={openPanelInfo.users}
          allDoctors={doctors}
          referenceElement={openPanelInfo.referenceElement}
          onClose={() => setOpenPanelInfo(null)}
        />
      )}
    </>
  );
};

export default DepartmentScheduleCalendar;
