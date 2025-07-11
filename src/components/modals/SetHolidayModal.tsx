import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { XIcon, CaretLeftIcon } from '@phosphor-icons/react';
import { DialogTitle } from '@headlessui/react';
import { toast } from 'react-toastify';
import { KeyedMutator } from 'swr';
import { getDateRange } from '@/lib/dates';

type Props = {
  selectedDates: Date[];
  setSelectedDates: React.Dispatch<React.SetStateAction<Date[]>>;
  mutateHolidays: KeyedMutator<Holiday[]>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const SetHolidayModal = ({
  selectedDates,
  setSelectedDates,
  isOpen,
  setIsOpen,
  mutateHolidays,
}: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dates: selectedDates.map((date) => date.toLocaleDateString('en-CA')),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      toast.success('Выходной(е) установлен(ы)');
      mutateHolidays();
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Ошибка при установке выходного'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
    setIsOpen(false);
  };

  return (
    <BaseModal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="bg-white p-6">
        <div className="flex justify-between items-center mb-4">
          <CaretLeftIcon className="invisible" size={20} />
          <DialogTitle className="text-base font-bold text-center text-gray-800">
            Установить праздничные дни
          </DialogTitle>
          <button onClick={handleClose} type="button">
            <XIcon size={20} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1 text-sm text-gray-700">
            {selectedDates.length === 1 ? 'Дата' : 'Даты'}
          </label>
          {selectedDates.length > 1 ? (
            <div className="flex gap-2">
              <input
                type="date"
                value={selectedDates[0].toLocaleDateString('en-CA')}
                onChange={handleStartChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
              <input
                type="date"
                value={selectedDates[
                  selectedDates.length - 1
                ].toLocaleDateString('en-CA')}
                onChange={handleEndChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>
          ) : (
            <input
              type="date"
              value={
                selectedDates.length === 0
                  ? ''
                  : selectedDates[0].toLocaleDateString('en-CA')
              }
              onChange={(e) => setSelectedDates([new Date(e.target.value)])}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-blue-500 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200"
        >
          {isSubmitting ? 'Установка...' : 'Установить'}
        </button>
      </div>
    </BaseModal>
  );
};

export default SetHolidayModal;
