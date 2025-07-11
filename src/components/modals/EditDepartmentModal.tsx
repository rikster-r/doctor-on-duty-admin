import { useState} from 'react';
import BaseModal from './BaseModal';
import { DialogTitle } from '@headlessui/react';
import { X } from '@phosphor-icons/react';
import { toast } from 'react-toastify';
import { KeyedMutator } from 'swr';
import RowFileInput from '../RowFileInput';

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  department: Department;
  mutateDepartments: KeyedMutator<Department[]>;
};

const EditDepartmentModal = ({
  isOpen,
  setIsOpen,
  department,
  mutateDepartments,
}: Props) => {
  const [name, setName] = useState(department.name);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    if (file) {
      formData.append('icon', file);
    }

    const res = await fetch(`/api/departments/${department.id}`, {
      method: 'PUT',
      body: formData,
    });

    if (res.ok) {
      toast.success('Отделение успешно обновлено');
      mutateDepartments();
      setIsOpen(false);
    } else {
      const data = await res.json();
      toast.error(data.error || 'Ошибка при обновлении');
    }
  };

  return (
    <BaseModal isOpen={isOpen} setIsOpen={setIsOpen}>
      <form className="bg-white p-6" onSubmit={handleSubmit}>
        <div className="flex justify-between items-center mb-4">
          <div className="invisible">
            <X size={20} />
          </div>
          <DialogTitle className="text-base font-bold text-center text-gray-800">
            Изменить отделение
          </DialogTitle>
          <button onClick={() => setIsOpen(false)} type="button">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 group">
          <label
            htmlFor="name"
            className="block font-medium mb-1 text-sm text-gray-700"
          >
            Название
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Введите название"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="peer w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="icon"
            className="block font-medium mb-1 text-sm text-gray-700"
          >
            Иконка
          </label>
          <RowFileInput name="icon" file={file} setFile={setFile} />
          <p className="mt-1 text-sm text-gray-500">
            SVG, PNG или JPG(макс. 500x500px)
          </p>
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

export default EditDepartmentModal;
