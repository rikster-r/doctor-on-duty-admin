import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { X, CaretLeft } from 'phosphor-react';
import { DialogTitle } from '@headlessui/react';
import { KeyedMutator } from 'swr';
import { toast } from 'react-toastify';
import AddUserMainStep from './AddUserMainStep';
import AddUserDoctorStep from './AddUserDoctorStep';
import AddUserImageStep from './AddUserImageStep';

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  mutateUsers: KeyedMutator<UsersPanelData>;
  departments: Department[];
};

type FormDataType = {
  firstName: string;
  middleName: string;
  lastName: string;
  role: string;
  phoneNumber: string;
  password: string;
  specialization: string;
  departmentId: number;
  profileImage: File | null;
};

const AddUserModal = ({
  isOpen,
  setIsOpen,
  mutateUsers,
  departments,
}: Props) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormDataType>({
    firstName: '',
    middleName: '',
    lastName: '',
    role: '',
    phoneNumber: '',
    password: '',
    specialization: '',
    departmentId: 0,
    profileImage: null,
  });

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (step < 3) {
      setStep((step) => step + 1);
      return;
    }

    createUser();
  };

  const createUser = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append('first_name', formData.firstName);
    formDataToSend.append('middle_name', formData.middleName)
    formDataToSend.append('last_name', formData.lastName);
    formDataToSend.append('role', formData.role);
    formDataToSend.append('phone_number', formData.phoneNumber);
    formDataToSend.append('password', formData.password);
    formDataToSend.append('specialization', formData.specialization);
    formDataToSend.append('department_id', formData.departmentId.toString());
    if (formData.profileImage) {
      formDataToSend.append('profile_image', formData.profileImage);
    }

    const res = await fetch(`/api/users`, {
      method: 'POST',
      body: formDataToSend,
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
            {step === 2 && 'Выберите фото пользователя'}
            {step === 3 && 'Введите данные доктора'}
          </DialogTitle>
          <button onClick={() => setIsOpen(false)} type="button">
            <X size={20} />
          </button>
        </div>

        {step === 1 && (
          <AddUserMainStep formData={formData} setFormData={setFormData} />
        )}
        {step === 2 && (
          <AddUserImageStep formData={formData} setFormData={setFormData} />
        )}
        {step === 3 && (
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
