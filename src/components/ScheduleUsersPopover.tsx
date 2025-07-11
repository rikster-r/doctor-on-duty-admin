import React, { useEffect, forwardRef, useState } from 'react';
import {
  useFloating,
  flip,
  offset,
  shift,
  autoUpdate,
} from '@floating-ui/react';
import {
  ClockIcon,
  PlusIcon,
  UserIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import UserImage from './UserImage';
import { KeyedMutator } from 'swr';
import { toast } from 'react-toastify';

type Props = {
  allDoctors: User[];
  dates: Date[];
  dayUsers: UserWithSchedule[];
  referenceElement: HTMLElement | null;
  onClose?: () => void;
  onDoctorClick: (doctor: User) => void;
  holidays: Holiday[];
  mutateHolidays: KeyedMutator<Holiday[]>;
};

const ScheduleUsersPopover = forwardRef<HTMLDivElement, Props>(
  (
    {
      dates,
      dayUsers,
      allDoctors,
      referenceElement,
      onDoctorClick,
      holidays,
      mutateHolidays,
    },
    ref
  ) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const hasUsers = dayUsers.length > 0;
    const scheduledUsers = dayUsers.filter((user) => user.schedule);
    const currentHoliday = holidays.find(
      (day) => day.date === dates[0].toLocaleDateString('en-CA')
    );
    const isHoliday = Boolean(currentHoliday);

    const { refs, floatingStyles, update } = useFloating({
      placement: 'bottom-start',
      middleware: [offset(8), shift(), flip()],
      elements: {
        reference: referenceElement,
      },
      whileElementsMounted: autoUpdate,
    });

    useEffect(() => {
      refs.setReference(referenceElement);
      update();
    }, [referenceElement, update, refs]);

    const formatTime = (time: string) => time.slice(0, 5);

    const formatDates = (dates: Date[]): string => {
      if (dates.length === 0) return 'No dates selected';
      const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());

      if (dates.length === 1) {
        return sortedDates[0].toLocaleDateString('ru-RU', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }

      const isConsecutive = (dates: Date[]): boolean => {
        for (let i = 1; i < dates.length; i++) {
          const prev = new Date(dates[i - 1]);
          const curr = new Date(dates[i]);
          if ((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24) !== 1) {
            return false;
          }
        }
        return true;
      };

      if (isConsecutive(sortedDates)) {
        const start = sortedDates[0].toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        const end = sortedDates[sortedDates.length - 1].toLocaleDateString(
          'ru-RU',
          {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }
        );
        return `${start} - ${end}`;
      }

      return sortedDates
        .map((d) =>
          d.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        )
        .join(', ');
    };

    const handleDeleteHoliday = async () => {
      if (!currentHoliday) return;

      setIsDeleting(true);
      try {
        console.log(dates);
        const res = await fetch('/api/holidays', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dates: dates.map((date) => date.toLocaleDateString('en-CA')),
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }

        // Update the holidays list by removing the deleted holiday
        await mutateHolidays(
          (currentHolidays) =>
            currentHolidays?.filter(
              (holiday) => holiday.id !== currentHoliday.id
            ) || [],
          { revalidate: true }
        );
      } catch (error) {
        console.error('Error deleting holiday:', error);
        toast.error(
          error instanceof Error
            ? error.message
            : 'Не удалось удалить праздничный день'
        );
      } finally {
        setIsDeleting(false);
      }
    };

    return (
      <div
        ref={(el) => {
          refs.setFloating(el);
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref && el) {
            (ref as React.RefObject<HTMLDivElement>).current = el;
          }
        }}
        style={floatingStyles}
        className="z-50 w-full max-w-sm rounded-lg shadow-lg bg-white border border-gray-300 ring-1 ring-black ring-opacity-5"
      >
        <div className="p-4">
          <div className="mb-3">
            <h4 className="font-semibold text-gray-900 text-base">
              {formatDates(dates)}
            </h4>
          </div>

          {isHoliday && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-800 font-medium">
                    Праздничный день
                  </span>
                </div>
                <button
                  onClick={handleDeleteHoliday}
                  disabled={isDeleting}
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:text-red-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Удалить праздничный день"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    {isDeleting ? 'Удаление...' : 'Удалить'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {!isHoliday && hasUsers && (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                {dates.length === 1
                  ? `На смене ${scheduledUsers.length} ${
                      scheduledUsers.length === 1
                        ? 'врач'
                        : scheduledUsers.length > 1 && scheduledUsers.length < 5
                        ? 'врача'
                        : 'врачей'
                    }`
                  : `Все врачи отдела (${allDoctors.length})`}
              </div>

              <div className="overflow-y-auto space-y-2 max-h-30">
                {(dates.length === 1 ? dayUsers : allDoctors).map(
                  (user: User | UserWithSchedule) => {
                    const isScheduled =
                      dates.length === 1 &&
                      'schedule' in user &&
                      Boolean(user.schedule);
                    return (
                      <button
                        key={user.id}
                        className={`${
                          isScheduled
                            ? 'text-blue-800 bg-blue-50 border border-blue-200'
                            : 'bg-gray-50'
                        } w-full flex items-center space-x-3 p-2 rounded-lg`}
                        onClick={() => onDoctorClick(user)}
                      >
                        <UserImage photoUrl={user.photo_url} size={32} />
                        <div className="flex-1 min-w-0">
                          <div
                            className={`${
                              isScheduled ? 'font-semibold' : 'font-medium'
                            } text-sm truncate text-left`}
                          >
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                        {isScheduled && user.schedule ? (
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <ClockIcon className="w-3 h-3" />
                            <span>
                              {formatTime(user.schedule.start_time)}-
                              {formatTime(user.schedule.end_time)}
                            </span>
                          </div>
                        ) : (
                          <div className="px-1">
                            <PlusIcon className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}
          {!isHoliday && !hasUsers && (
            <div className="text-center py-4 text-gray-500">
              <UserIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">В этом отделении никто не работает</p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ScheduleUsersPopover.displayName = 'ScheduleUsersPopover';

export default ScheduleUsersPopover;
