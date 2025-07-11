import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { XIcon, CaretLeftIcon, TrashIcon } from '@phosphor-icons/react';
import { DialogTitle } from '@headlessui/react';

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
  variant?: 'danger' | 'warning';
};

const DeleteConfirmModal = ({
  isOpen,
  setIsOpen,
  title = 'Подтвердить удаление',
  message = 'Вы уверены, что хотите удалить? Это действие нельзя отменить.',
  confirmText = 'Удалить',
  cancelText = 'Отменить',
  onConfirm,
  onCancel,
  variant = 'danger',
}: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await onConfirm();
    handleClose();
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const getButtonStyles = () => {
    const baseStyles =
      'font-semibold py-3 rounded-xl transition disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200';

    if (variant === 'danger') {
      return `${baseStyles} bg-red-500 text-white hover:bg-red-600`;
    }

    return `${baseStyles} bg-orange-500 text-white hover:bg-orange-600`;
  };

  return (
    <BaseModal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="bg-white p-6">
        <div className="flex justify-between items-center mb-4">
          <CaretLeftIcon className="invisible" size={20} />
          <DialogTitle className="text-base font-bold text-center text-gray-800">
            {title}
          </DialogTitle>
          <button onClick={handleClose} type="button">
            <XIcon size={20} />
          </button>
        </div>

        <div className="mb-6 text-center">
          <div className="flex justify-center mb-3">
            <div
              className={`p-3 rounded-full ${
                variant === 'danger' ? 'bg-red-100' : 'bg-orange-100'
              }`}
            >
              <TrashIcon
                size={24}
                className={
                  variant === 'danger' ? 'text-red-500' : 'text-orange-500'
                }
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition disabled:bg-gray-200 disabled:text-gray-500"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`flex-1 ${getButtonStyles()}`}
          >
            {isSubmitting ? 'Удаление...' : confirmText}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default DeleteConfirmModal;
