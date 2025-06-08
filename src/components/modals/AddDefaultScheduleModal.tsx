import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { X, CaretLeft } from 'phosphor-react';
import { DialogTitle } from '@headlessui/react';
import { toast } from 'react-toastify';

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  doctorId: number;
  dayOfWeek: string;
  onScheduleAdded: () => void;
};

const daysOfWeekMap: Record<string, string> = {
  monday: 'Понедельник',
  tuesday: 'Вторник',
  wednesday: 'Среда',
  thursday: 'Четверг',
  friday: 'Пятница',
  saturday: 'Суббота',
  sunday: 'Воскресенье',
};

const AddDefaultScheduleModal = ({
  isOpen,
  setIsOpen,
  dayOfWeek,
  doctorId,
  onScheduleAdded,
}: Props) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/doctors/${doctorId}/schedules/defaults`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
        }),
      });

      if (res.ok) {
        toast.success('График успешно добавлен');
        setStartTime('');
        setEndTime('');
        setIsOpen(false);
        onScheduleAdded();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Ошибка при добавлении графика');
      }
    } catch (error) {
      console.error(error);
      toast.error('Ошибка при добавлении графика');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStartTime('');
    setEndTime('');
    setIsOpen(false);
  };

  return (
    <BaseModal isOpen={isOpen} setIsOpen={setIsOpen}>
      <form className="bg-white p-6" onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-4">
          <CaretLeft className="invisible" size={20} />
          <DialogTitle className="text-base font-bold text-center text-gray-800">
            Добавить график
          </DialogTitle>
          <button onClick={handleClose} type="button">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1 text-sm text-gray-700">
            День недели
          </label>
          <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700">
            {daysOfWeekMap[dayOfWeek] || dayOfWeek}
          </div>
        </div>

        <div className="mb-4 group">
          <label
            htmlFor="startTime"
            className="block font-medium mb-1 text-sm text-gray-700"
          >
            Время начала
          </label>
          <input
            type="time"
            id="startTime"
            name="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="peer w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
            required
          />
        </div>

        <div className="mb-4 group">
          <label
            htmlFor="endTime"
            className="block font-medium mb-1 text-sm text-gray-700"
          >
            Время окончания
          </label>
          <input
            type="time"
            id="endTime"
            name="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="peer w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200"
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </button>
      </form>
    </BaseModal>
  );
};

export default AddDefaultScheduleModal;
