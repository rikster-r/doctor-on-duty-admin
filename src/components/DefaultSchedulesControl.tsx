import { useState } from 'react';
import { Plus, X, Moon } from 'phosphor-react';
import { toast } from 'react-toastify';
import AddDefaultScheduleModal from './modals/AddDefaultScheduleModal';

type Props = {
  defaultSchedules: DefaultSchedule[];
  selectedDoctorId: number;
  mutateDefaultSchedules: () => void;
};

const daysOfWeek = [
  { id: 'monday', text: 'Пн' },
  { id: 'tuesday', text: 'Вт' },
  { id: 'wednesday', text: 'Ср' },
  { id: 'thursday', text: 'Чт' },
  { id: 'friday', text: 'Пт' },
  { id: 'saturday', text: 'Сб' },
  { id: 'sunday', text: 'Вс' },
];

export default function DefaultSchedulesGrid({
  defaultSchedules,
  selectedDoctorId,
  mutateDefaultSchedules,
}: Props) {
  const [addDefaultScheduleModalOpen, setAddDefaultScheduleModalOpen] = useState(false);
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string | null>(null);

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

  return (
    <>
      <div className="mt-10">
        <div className="grid grid-cols-7 gap-1">
          {daysOfWeek.map(({ id, text }) => (
            <div
              key={id}
              className="font-semibold text-gray-700 text-center p-2"
            >
              {text}
            </div>
          ))}

          {daysOfWeek.map((day) => {
            const schedule = defaultSchedules.find(
              (s) => s.day_of_week === day.id
            );
            return (
              <div
                key={day.id}
                className="p-3 border border-gray-200 text-center min-h-[70px] flex items-center justify-center"
              >
                {schedule ? (
                  <div
                    className={`bg-opacity-20 rounded cursor-pointer hover:bg-opacity-30 transition-colors relative group w-full ${
                      schedule.is_day_off
                        ? 'bg-gray-300 text-gray-600'
                        : 'bg-blue-200 text-blue-800'
                    }`}
                  >
                    {schedule.is_day_off ? (
                      <div className="flex items-center justify-center p-2">
                        <Moon size={14} className="mr-1" />
                        <span className="text-xs font-medium">Выходной</span>
                      </div>
                    ) : (
                      <div className="p-2 text-xs font-medium flex justify-center text-center">
                        <span>{schedule.start_time.slice(0, 5)}</span>-
                        <span>{schedule.end_time.slice(0, 5)}</span>
                      </div>
                    )}
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDefaultSchedule(schedule.id);
                        }}
                        className="text-red-500 hover:text-red-700 bg-white rounded-full p-1 shadow-sm"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full min-h-12 flex">
                    <button
                      onClick={() => {
                        setSelectedDayOfWeek(day.id);
                        setAddDefaultScheduleModalOpen(true);
                      }}
                      className="flex-1 border-2 border-dashed border-gray-300 rounded hover:border-blue-400 flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors mr-1"
                      title="Добавить время работы"
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => setDayOff(day.id)}
                      className="w-8 border-2 border-dashed border-gray-300 rounded hover:border-gray-400 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                      title="Выходной день"
                    >
                      <Moon size={12} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
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
