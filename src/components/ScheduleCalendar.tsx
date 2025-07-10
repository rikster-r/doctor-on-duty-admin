import React, { useEffect, useMemo, useState, useRef } from 'react';
import { CaretLeft, CaretRight } from 'phosphor-react';
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

type Props = {
  doctors: User[];
  selectedDepartmentId: number | null;
  schedules: DepartmentDateSchedule[] | undefined;
  mutateSchedules: KeyedMutator<DepartmentDateSchedule[]>;
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
};

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

  // New state for drag selection
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState<Date | null>(null);
  const [dragEndDate, setDragEndDate] = useState<Date | null>(null);

  const calendarRef = useRef<HTMLDivElement>(null);
  const dayElementsRef = useRef<Map<string, HTMLElement>>(new Map());

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

  // Check if date is in drag range
  const isDateInDragRange = (date: Date): boolean => {
    if (!isDragging || !dragStartDate || !dragEndDate) return false;
    const time = date.getTime();
    const startTime = Math.min(dragStartDate.getTime(), dragEndDate.getTime());
    const endTime = Math.max(dragStartDate.getTime(), dragEndDate.getTime());
    return time >= startTime && time <= endTime;
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

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        resetSelection();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          const lastDateStr = lastDate.toISOString().split('T')[0];
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
        <div className="p-1 sm:p-6 touch-none" ref={calendarRef} {...bind()}>
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
              const isToday = isSameDay(date, new Date());
              const dayUsers = getScheduleForDate(date);
              const hasUsers = dayUsers.length > 0;
              const dateStr = date.toLocaleDateString('en-CA');
              const isSelected = isDateInSelectedRange(date);
              const isInDragRange = isDateInDragRange(date);

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
                    ${
                      !isCurrentMonth
                        ? 'text-gray-300 bg-gray-50 hover:bg-gray-100'
                        : 'text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                    }
                    ${
                      isInDragRange && !isSelected
                        ? 'border-blue-200 ring-2 ring-blue-200'
                        : ''
                    }
                    ${isToday && !isSelected ? 'bg-blue-200' : ''}
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
          onClose={() => setOpenPanelInfo(null)}
        />
      )}
    </>
  );
};

export default DepartmentScheduleCalendar;
