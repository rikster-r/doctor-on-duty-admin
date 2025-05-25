import { DepartmentsSortableList } from './DepartmentsSortableList';
import Layout from './Layout';
import { fetcher } from '@/lib/fetcher';
import useSWR from 'swr';
import React, { useState } from 'react';
import { Plus } from 'phosphor-react';
import EditDepartmentModal from './modals/EditDepartmentModal';
import AddDepartmentModal from './modals/AddDepartmentModal';

const DepartmentsDashboard = () => {
  const {
    data: departments,
    mutate: mutateDepartments,
    isLoading,
  } = useSWR<Department[]>(`/api/departments`, fetcher);

  const [selectedDepartment, setSelectedDepartment] = useState<
    Department | undefined
  >();
  const [editDepartmentModalOpen, setEditDepartmentModalOpen] = useState(false);
  const [addDepartmentModalOpen, setAddDepartmentModalOpen] = useState(false);

  return (
    <Layout
      title="Отделения | Дежурный доктор"
      description="Управление отделениями больницы"
    >
      <div className="p-4 w-full max-w-[700px]">
        <div className="mb-6 flex justify-between">
          <div className="max-w-[80%]">
            <h1 className="text-lg font-bold text-gray-800">
              Панель отделений
            </h1>
            <p className="text-gray-500 text-sm w-full">
              Управление списком отделений и их настройками
            </p>
          </div>
          <div className="flex items-center">
            <button
              className="flex items-center gap-2 bg-blue-500 text-white p-2 sm:px-4 sm:py-3 rounded-full hover:bg-blue-600"
              onClick={() => setAddDepartmentModalOpen(true)}
            >
              <Plus size={18} />
              <span className="hidden sm:block">Добавить отделение</span>
            </button>
          </div>
        </div>
        {/* Загрузка */}
        {isLoading && (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white shadow rounded-2xl p-4 flex flex-col gap-3 animate-pulse"
              >
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                <div className="h-3 bg-gray-300 rounded w-full mb-18" />
              </div>
            ))}
          </div>
        )}
        {/* Ошибка либо пустой список */}
        {!isLoading && (!departments || departments.length === 0) && (
          <div className="flex justify-center items-center h-40">
            <span className="text-gray-400 text-sm">Не найдены отделения.</span>
          </div>
        )}
        {/* Список с отделениями */}
        {!isLoading && departments && departments.length > 0 && (
          <DepartmentsSortableList
            departments={departments}
            setSelectedDepartment={setSelectedDepartment}
            setEditDepartmentModalOpen={setEditDepartmentModalOpen}
            mutate={mutateDepartments}
          />
        )}
      </div>
      {editDepartmentModalOpen && selectedDepartment && (
        <EditDepartmentModal
          isOpen={editDepartmentModalOpen}
          setIsOpen={setEditDepartmentModalOpen}
          department={selectedDepartment}
          mutateDepartments={mutateDepartments}
        />
      )}
      {addDepartmentModalOpen && (
        <AddDepartmentModal
          isOpen={addDepartmentModalOpen}
          setIsOpen={setAddDepartmentModalOpen}
          mutateDepartments={mutateDepartments}
        />
      )}
    </Layout>
  );
};

export default DepartmentsDashboard;
