import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { X, CaretLeft } from '@phosphor-icons/react';
import { DialogTitle } from '@headlessui/react';
import { toast } from 'react-toastify';
import { KeyedMutator } from 'swr';
import { getDateRange } from '@/lib/dates';
import DoctorCombobox from '../DoctorCombobox';

type Props = {
  selectedDates: Date[];
  setSelectedDates: React.Dispatch<React.SetStateAction<Date[]>>;
  selectedDoctor: User;
  setSelectedDoctor: (doctor: User) => void;
  doctors: User[];
  mutateSchedules: KeyedMutator<DepartmentDateSchedule[]>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const ChangeScheduleModal = ({
  selectedDates,
  setSelectedDates,
  selectedDoctor,
  setSelectedDoctor,
  doctors,
  isOpen,
  setIsOpen,
  mutateSchedules,
}: Props) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/users/${selectedDoctor.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dates: selectedDates.map((date) => date.toLocaleDateString('en-CA')),
          start_time: startTime,
          end_time: endTime,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      mutateSchedules();
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : 'Ошибка при изменении графика'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearSchedule = async () => {
    setIsClearing(true);

    try {
      const res = await fetch(`/api/users/${selectedDoctor.id}/schedule`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dates: selectedDates.map((date) => date.toLocaleDateString('en-CA')),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      mutateSchedules();
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : 'Ошибка при очистке графика'
      );
    } finally {
      setIsClearing(false);
    }
  };

  // getDateRange()
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = new Date(e.target.value);
    const end = selectedDates[selectedDates.length - 1];
    setSelectedDates(getDateRange(newStart, end));
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = new Date(e.target.value);
    const start = selectedDates[0];
    setSelectedDates(getDateRange(start, newEnd));
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
            Изменить график
          </DialogTitle>
          <button onClick={handleClose} type="button">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <DoctorCombobox
            doctors={doctors}
            selectedDoctorId={selectedDoctor.id}
            onDoctorChange={setSelectedDoctor}
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1 text-sm text-gray-700">
            {selectedDates.length === 1 ? 'Дата' : 'Даты'}
          </label>
          {selectedDates.length === 1 ? (
            <input
              type="date"
              value={selectedDates[0].toLocaleDateString('en-CA')}
              onChange={(e) => setSelectedDates([new Date(e.target.value)])}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
              required
            />
          ) : (
            <div className="flex gap-2">
              <input
                type="date"
                value={selectedDates[0].toLocaleDateString('en-CA')}
                onChange={handleStartChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
                required
              />
              <input
                type="date"
                value={selectedDates[
                  selectedDates.length - 1
                ].toLocaleDateString('en-CA')}
                onChange={handleEndChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
                required
              />
            </div>
          )}
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

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleClearSchedule}
            disabled={isSubmitting || isClearing}
            className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-xl hover:bg-gray-200 transition disabled:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-gray-100"
          >
            {isClearing ? 'Очистка...' : 'Очистить график врача'}
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isClearing}
            className="flex-1 bg-blue-500 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200"
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default ChangeScheduleModal;
