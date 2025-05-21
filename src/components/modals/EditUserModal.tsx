import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { X, CaretLeft, CaretDown } from 'phosphor-react';
import { DialogTitle } from '@headlessui/react';
import { KeyedMutator } from 'swr';
import { toast } from 'react-toastify';

type Props = {
  isOpen: boolean;
  user: User;
  setIsOpen: (open: boolean) => void;
  mutateUsers: KeyedMutator<UsersPanelData>;
  departments: Department[];
};

const EditUserModal = ({
  isOpen,
  setIsOpen,
  user,
  mutateUsers,
  departments,
}: Props) => {
  const [formData, setFormData] = useState({
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    phoneNumber: user.phone_number,
    specialization: user.doctor_data?.specialization,
    departmentId: user.doctor_data ? Number(user.doctor_data.department.id) : 0,
  });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
        phone_number: formData.phoneNumber,
        specialization: formData.specialization,
        department_id: formData.departmentId,
      }),
    });

    if (res.ok) {
      toast.success('Пользователь успешно обновлен');
      mutateUsers();
      setIsOpen(false);
    } else {
      const data = await res.json();
      toast.error(data.error);
    }
  };

  const handleInputChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement
  > = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <BaseModal isOpen={isOpen} setIsOpen={setIsOpen}>
      <form className="bg-white p-6" onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-4">
          <CaretLeft className="invisible" size={20} />

          <DialogTitle className="text-base font-bold text-center text-gray-800">
            Изменить данные
          </DialogTitle>
          <button onClick={() => setIsOpen(false)} type="button">
            <X size={20} />
          </button>
        </div>

        <div>
          <div className="flex gap-2">
            <div className="mb-4 group">
              <label
                htmlFor="firstName"
                className="block font-medium mb-1 text-sm text-gray-700 group-focus-within:text-blue-800"
              >
                Имя
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Введите имя"
                value={formData.firstName}
                onChange={handleInputChange}
                className="peer w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
              />
            </div>
            <div className="mb-4 group">
              <label
                htmlFor="lastName"
                className="block font-medium mb-1 text-sm text-gray-700 group-focus-within:text-blue-800"
              >
                Фамилия
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Введите фамилию"
                value={formData.lastName}
                onChange={handleInputChange}
                className="peer w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
              />
            </div>
          </div>
          <div className="mb-4 group">
            <label
              htmlFor="phoneNumber"
              className="block font-medium mb-1 text-sm text-gray-700 group-focus-within:text-blue-800"
            >
              Номер телефона
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="+7"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="peer w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
            />
          </div>
          <div className="mb-4 group">
            <label
              htmlFor="role"
              className="block font-medium mb-1 text-sm text-gray-700 group-focus-within:text-blue-800"
            >
              Роль
            </label>
            <div className="relative">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
              >
                <option value="" disabled>
                  Выберите роль
                </option>
                <option value="admin">Администратор</option>
                <option value="doctor">Доктор</option>
              </select>
              <CaretDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
          </div>
          <div className="mb-4 group">
            <label
              htmlFor="departmentId"
              className="block font-medium mb-1 text-sm text-gray-700 group-focus-within:text-blue-800"
            >
              Отделение
            </label>
            <div className="relative">
              <select
                id="departmentId"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
              >
                <option value={0} disabled>
                  Выберите отделение
                </option>
                {departments.map((department) => (
                  <option value={department.id} key={department.id}>
                    {department.name.charAt(0).toUpperCase() +
                      department.name.slice(1)}
                  </option>
                ))}
              </select>
              <CaretDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
              />
            </div>
          </div>
          <div className="mb-4 group">
            <label
              htmlFor="specialization"
              className="block font-medium mb-1 text-sm text-gray-700 group-focus-within:text-blue-800"
            >
              Специальность
            </label>
            <input
              type="text"
              id="specialization"
              name="specialization"
              placeholder="Введите имя"
              value={formData.specialization}
              onChange={handleInputChange}
              className="peer w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
            />
          </div>

          <button className="w-full bg-blue-500 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200">
            Сохранить
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default EditUserModal;
