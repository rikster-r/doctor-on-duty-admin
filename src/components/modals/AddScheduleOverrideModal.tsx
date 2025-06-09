import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { X, CaretLeft } from 'phosphor-react';
import { DialogTitle } from '@headlessui/react';
import { toast } from 'react-toastify';

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  doctorId: number;
  date: string; // Format: YYYY-MM-DD
  onOverrideAdded: () => void;
};

const formatDateToRussian = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const AddScheduleOverrideModal = ({
  isOpen,
  setIsOpen,
  doctorId,
  date,
  onOverrideAdded,
}: Props) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/doctors/${doctorId}/schedules/overrides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          start_time: startTime,
          end_time: endTime,
        }),
      });

      if (res.ok) {
        toast.success(
          `График доктора на ${formatDateToRussian(date)} успешно изменен`
        );
        setStartTime('');
        setEndTime('');
        setIsOpen(false);
        onOverrideAdded();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Ошибка при добавлении переопределения');
      }
    } catch (error) {
      console.error(error);
      toast.error('Ошибка при добавлении переопределения');
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
            Изменить график на дату
          </DialogTitle>
          <button onClick={handleClose} type="button">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1 text-sm text-gray-700">
            Дата
          </label>
          <div className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700">
            {formatDateToRussian(date)}
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          <div className="group w-full">
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

          <div className="group w-full">
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

export default AddScheduleOverrideModal;
