import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { X, CaretLeft } from 'phosphor-react';
import { DialogTitle } from '@headlessui/react';
import { KeyedMutator } from 'swr';
import { toast } from 'react-toastify';
import AddUserMainStep from './AddUserMainStep';
import AddUserDoctorStep from './AddUserDoctorStep';

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  mutateUsers: KeyedMutator<UsersPanelData>;
  departments: Department[];
};

const AddUserModal = ({
  isOpen,
  setIsOpen,
  mutateUsers,
  departments,
}: Props) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    phoneNumber: '',
    password: '',
    specialization: '',
    departmentId: 0,
  });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (formData.role === 'doctor' && step === 1) {
      setStep(2);
      return;
    }

    createUser();
  };

  const createUser = async () => {
    const res = await fetch(`/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
        phone_number: formData.phoneNumber,
        password: formData.password,
        specialization: formData.specialization,
        department_id: formData.departmentId,
      }),
    });

    if (res.ok) {
      toast.success('Пользователь успешно добавлен');
      mutateUsers();
      setIsOpen(false);
    } else {
      const data = await res.json();
      toast.error(data.error);
    }
  };

  return (
    <BaseModal isOpen={isOpen} setIsOpen={setIsOpen}>
      <form className="bg-white p-6" onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-4">
          <button
            className={`${step > 1 ? 'visible' : 'invisible'}`}
            type="button"
            onClick={() => setStep((step) => step - 1)}
          >
            <CaretLeft />
          </button>
          <DialogTitle className="text-base font-bold text-center text-gray-800">
            {step === 1 && 'Добавить пользователя'}
            {step === 2 && 'Введите данные доктора'}
          </DialogTitle>
          <button onClick={() => setIsOpen(false)} type="button">
            <X size={20} />
          </button>
        </div>

        {step === 1 && (
          <AddUserMainStep formData={formData} setFormData={setFormData} />
        )}
        {step === 2 && (
          <AddUserDoctorStep
            formData={formData}
            setFormData={setFormData}
            departments={departments}
          />
        )}
      </form>
    </BaseModal>
  );
};

export default AddUserModal;
