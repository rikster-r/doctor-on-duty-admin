import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  CaretLeftIcon,
  CaretRightIcon,
  IslandIcon,
} from '@phosphor-icons/react';
import { useDrag } from '@use-gesture/react';
import type { KeyedMutator } from 'swr';
import SchedulePopoverPanel from './ScheduleUsersPopover';
import {
  getCalendarDays,
  getDateRange,
  dayNames,
  monthNames,
} from '@/lib/dates';
import { isSameDay } from 'date-fns';
import ChangeScheduleModal from './modals/ChangeScheduleModal';
import SetHolidayModal from './modals/SetHolidayModal';

type Props = {
  doctors: User[];
  selectedDepartmentId: number | null;
  schedules: DepartmentDateSchedule[] | undefined;
  mutateSchedules: KeyedMutator<DepartmentDateSchedule[]>;
  holidays: Holiday[];
  mutateHolidays: KeyedMutator<Holiday[]>;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
};

const DepartmentScheduleCalendar: React.FC<Props> = ({
  doctors,
  selectedDepartmentId,
  schedules,
  mutateSchedules,
  holidays,
  mutateHolidays,
  currentDate,
  setCurrentDate,
}) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [openPanelInfo, setOpenPanelInfo] = useState<{
    referenceElement: HTMLElement;
    users: UserWithSchedule[];
  } | null>(null);
  const [scheduleModalInfo, setScheduleModalInfo] = useState<{
    selectedDoctor: User;
  } | null>(null);
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);

  // New state for drag selection
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null);
  const [dragEndDate, setDragEndDate] = useState<Date | null>(null);

  const calendarRef = useRef<HTMLDivElement>(null);
  const dayElementsRef = useRef<Map<string, HTMLElement>>(new Map());
  const schedulesPopoverRef = useRef<HTMLDivElement>(null);
  const addHolidaysButtonRef = useRef<HTMLButtonElement>(null);

  // Get date from element
  const getDateFromElement = (element: HTMLElement): Date | null => {
    const dateStr = element.dataset.date;
    return dateStr ? new Date(dateStr) : null;
  };

  // Get element under coordinates
  const getElementUnderPoint = (x: number, y: number): HTMLElement | null => {
    const element = document.elementFromPoint(x, y);
    return element?.closest('[data-date]') as HTMLElement | null;
  };

  // Check if date is in drag range (accounting for timezone issues)
  const isDateInDragRange = (date: Date): boolean => {
    if (!isDragging || !dragStartDate || !dragEndDate) return false;
    const start = dragStartDate < dragEndDate ? dragStartDate : dragEndDate;
    const end = dragStartDate > dragEndDate ? dragStartDate : dragEndDate;
    // Compare only the date part, ignoring time and timezone
    const dateValue = Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const startValue = Date.UTC(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );
    const endValue = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    return dateValue >= startValue && dateValue <= endValue;
  };

  // Check if date is in selected range
  const isDateInSelectedRange = (date: Date): boolean => {
    return selectedDates.some((d) => isSameDay(d, date));
  };

  // Reset selection and panel
  const resetSelection = () => {
    setSelectedDates([]);
    setOpenPanelInfo(null);
  };

  // Closing handlers
  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      if (scheduleModalInfo || holidayModalOpen) return;

      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        !schedulesPopoverRef.current?.contains(event.target as Node) &&
        !addHolidaysButtonRef.current?.contains(event.target as Node)
      ) {
        resetSelection();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        resetSelection();
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [scheduleModalInfo, holidayModalOpen]);

  // Drag gesture handler
  const bind = useDrag(
    ({ down, xy: [x, y], initial: [initialX, initialY] }) => {
      if (!down) {
        // End drag
        if (isDragging && dragStartDate && dragEndDate) {
          const rangeDates = getDateRange(dragStartDate, dragEndDate);
          setSelectedDates(rangeDates);

          // Open panel for the last selected date
          const lastDate = rangeDates[rangeDates.length - 1];
          const lastDateStr = lastDate.toLocaleDateString('en-CA')
          const lastElement = dayElementsRef.current.get(lastDateStr);

          if (lastElement) {
            const dayUsers = getScheduleForDate(lastDate);
            setOpenPanelInfo({
              referenceElement: lastElement,
              users: dayUsers,
            });
          }
        }

        setIsDragging(false);
        setDragStartDate(null);
        setDragEndDate(null);
        return;
      }

      // Start or continue drag
      const currentElement = getElementUnderPoint(x, y);
      if (!currentElement) return;

      const currentDate = getDateFromElement(currentElement);
      if (!currentDate) return;

      if (!isDragging) {
        // Start drag - Reset states when new drag starts
        const initialElement = getElementUnderPoint(initialX, initialY);
        const initialDate = initialElement
          ? getDateFromElement(initialElement)
          : null;

        if (initialDate) {
          // Reset dates and panel info when starting a new drag
          resetSelection();

          setIsDragging(true);
          setDragStartDate(initialDate);
          setDragEndDate(currentDate);
        }
      } else {
        // Continue drag
        setDragEndDate(currentDate);
      }
    },
    {
      filterTaps: true,
      threshold: 5,
    }
  );

  const handleDayClick = (
    referenceElement: HTMLElement,
    date: Date,
    users: UserWithSchedule[]
  ) => {
    if (isDragging) return; // Ignore clicks during drag

    // Unselect if only one cell and is already selected
    if (selectedDates.length === 1 && isSameDay(selectedDates[0], date)) {
      resetSelection();
      return;
    }

    // Reset entire range select and select the date
    resetSelection();
    setSelectedDates([date]);
    setOpenPanelInfo({
      referenceElement,
      users,
    });
  };

  // Reset when changing departments or selected month
  useEffect(() => {
    resetSelection();
    setIsDragging(false);
    setDragStartDate(null);
    setDragEndDate(null);
  }, [selectedDepartmentId, currentDate]);

  // Generate calendar days
  const calendarDays = useMemo(
    () => getCalendarDays(currentDate),
    [currentDate]
  );

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
              <CaretLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 w-[150px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <CaretRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-evenly space-x-3 sm:space-x-6 text-xs sm:text-sm text-gray-600 mt-4 sm:mt-0">
            <button
              type="button"
              onClick={() => {
                resetSelection();
                setHolidayModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              ref={addHolidaysButtonRef}
            >
              <IslandIcon className="w-5 h-5" />
              <span>Добавить праздничные дни</span>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-1 sm:p-6 touch-none" {...bind()}>
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {dayNames.map((day) => (
              <div
                key={day}
                className={`${
                  day === 'Сб' || day === 'Вс'
                    ? 'text-amber-700'
                    : 'text-gray-500'
                } p-1 text-center text-sm font-medium`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1" ref={calendarRef}>
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              const dayUsers = getScheduleForDate(date);
              const hasUsers = dayUsers.length > 0;
              const dateStr = date.toLocaleDateString('en-CA');
              const isSelected = isDateInSelectedRange(date);
              const isInDragRange = isDateInDragRange(date);
              const isHoliday = holidays.some((day) => day.date === dateStr);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              let bgClass = '';
              if (isHoliday) {
                bgClass =
                  'bg-emerald-100 text-emerald-800 font-semibold hover:bg-emerald-200 border border-emerald-200';
              } else if (!isCurrentMonth) {
                bgClass = 'bg-gray-50 text-gray-300';
              } else if (isWeekend) {
                bgClass =
                  'bg-amber-50 text-amber-700 font-medium hover:bg-amber-100';
              } else {
                bgClass =
                  'bg-white text-gray-700 hover:bg-gray-50 border border-gray-100';
              }

              return (
                <button
                  key={index}
                  ref={(el) => {
                    if (el) {
                      dayElementsRef.current.set(dateStr, el);
                    } else {
                      dayElementsRef.current.delete(dateStr);
                    }
                  }}
                  data-date={dateStr}
                  className={`
                    h-full w-full p-1 lg:p-3 min-h-20 rounded-lg text-left transition-all duration-200 relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                    ${bgClass}
                    ${
                      !isCurrentMonth
                        ? ''
                        : 'border border-gray-200 hover:border-gray-300'
                    }
                    ${
                      isInDragRange && !isSelected
                        ? 'border-blue-200 ring-2 ring-blue-200'
                        : ''
                    }
                    ${isSelected ? 'border-blue-500 ring-2 ring-blue-500' : ''}
                    ${isDragging ? 'select-none' : ''}
                  `}
                  onClick={(e) =>
                    handleDayClick(e.currentTarget, date, dayUsers)
                  }
                  style={{
                    userSelect: isDragging ? 'none' : 'auto',
                    touchAction: 'none', // Prevent scrolling during drag
                  }}
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
          onDoctorClick={(doctor: User) => {
            setOpenPanelInfo(null);
            setScheduleModalInfo({ selectedDoctor: doctor });
          }}
          onClose={() => setOpenPanelInfo(null)}
          holidays={holidays}
          mutateHolidays={mutateHolidays}
          ref={schedulesPopoverRef}
        />
      )}
      {scheduleModalInfo && (
        <ChangeScheduleModal
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
          selectedDoctor={scheduleModalInfo.selectedDoctor}
          setSelectedDoctor={(doctor: User) =>
            setScheduleModalInfo({ selectedDoctor: doctor })
          }
          doctors={doctors}
          mutateSchedules={mutateSchedules}
          isOpen={Boolean(scheduleModalInfo)}
          // internally used only for closing
          setIsOpen={() => setScheduleModalInfo(null)}
        />
      )}
      {holidayModalOpen && (
        <SetHolidayModal
          selectedDates={selectedDates}
          setSelectedDates={setSelectedDates}
          mutateHolidays={mutateHolidays}
          isOpen={holidayModalOpen}
          setIsOpen={setHolidayModalOpen}
        />
      )}
    </>
  );
};

export default DepartmentScheduleCalendar;
