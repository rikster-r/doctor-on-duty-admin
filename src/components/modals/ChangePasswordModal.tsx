import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { X, CaretLeft } from 'phosphor-react';
import { DialogTitle } from '@headlessui/react';
import { toast } from 'react-toastify';

type Props = {
  isOpen: boolean;
  user: User;
  setIsOpen: (open: boolean) => void;
};

const ChangePasswordModal = ({ isOpen, setIsOpen, user }: Props) => {
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    });

    if (res.ok) {
      toast.success('Пароль успешно изменён');
      setNewPassword('');
      setIsOpen(false);
    } else {
      const data = await res.json();
      toast.error(data.error || 'Ошибка при смене пароля');
    }
  };

  return (
    <BaseModal isOpen={isOpen} setIsOpen={setIsOpen}>
      <form className="bg-white p-6" onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-4">
          <CaretLeft className="invisible" size={20} />
          <DialogTitle className="text-base font-bold text-center text-gray-800">
            Сменить пароль
          </DialogTitle>
          <button onClick={() => setIsOpen(false)} type="button">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 group">
          <label
            htmlFor="newPassword"
            className="block font-medium mb-1 text-sm text-gray-700"
          >
            Новый пароль
          </label>
          <input
            type="text"
            id="newPassword"
            name="newPassword"
            placeholder="Введите новый пароль"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="peer w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200"
        >
          Сохранить
        </button>
      </form>
    </BaseModal>
  );
};

export default ChangePasswordModal;
