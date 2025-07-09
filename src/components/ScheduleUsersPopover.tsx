import React, { useEffect } from 'react';
import {
  useFloating,
  flip,
  offset,
  shift,
  autoUpdate,
} from '@floating-ui/react';
import { Clock, Plus, User as UserIcon } from 'phosphor-react';
import UserImage from './UserImage';

type Props = {
  allDoctors: User[];
  dates: Date[];
  dayUsers: UserWithSchedule[];
  referenceElement: HTMLElement | null;
  onClose?: () => void;
};

export default function SchedulePopoverPanel({
  dates,
  dayUsers,
  allDoctors,
  referenceElement,
}: Props) {
  const hasUsers = dayUsers.length > 0;
  const scheduledUsers = dayUsers.filter((user) => user.schedule);

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

  useEffect(() => {

  }, [])

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

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      className="z-50 w-full max-w-sm rounded-lg shadow-lg bg-white border border-gray-300 ring-1 ring-black ring-opacity-5"
    >
      <div className="p-4">
        <div className="mb-3">
          <h4 className="font-semibold text-gray-900 text-base">
            {formatDates(dates)}
          </h4>
        </div>

        {hasUsers ? (
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
                          <Clock className="w-3 h-3" />
                          <span>
                            {formatTime(user.schedule.start_time)}-
                            {formatTime(user.schedule.end_time)}
                          </span>
                        </div>
                      ) : (
                        <div className="px-1">
                          <Plus className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <UserIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">В этом отделении никто не работает</p>
          </div>
        )}
      </div>
    </div>
  );
}
