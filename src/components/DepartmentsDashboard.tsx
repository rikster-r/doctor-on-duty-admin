import Layout from './Layout';
import { fetcher } from '@/lib/fetcher';
import useSWR from 'swr';

import React, { useState } from 'react';
import { ImageSquare, Trash, NotePencil, Plus } from 'phosphor-react';
import { CldImage } from 'next-cloudinary';
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
      <div className="min-h-screen p-4  w-full max-w-[700px]">
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
          <div className="grid grid-cols-3 gap-2">
            {departments.map((department) => (
              <div
                key={department.id}
                className="bg-white shadow-lg rounded-2xl p-4 sm:px-6 flex flex-col items-center gap-3 hover:shadow-xl transition-shadow relative"
              >
                <div className="relative w-full">
                  {!department.photo_url ? (
                    <div className="w-10  h-10 sm:w-12 sm:h-12 flex items-center ">
                      <ImageSquare className="text-gray-600" size={24} />
                    </div>
                  ) : (
                    <div className="text-blue-600 w-10 h-10 sm:w-12 sm:h-12 mr-auto">
                      <CldImage
                        width="1000"
                        height="1000"
                        src={department.photo_url}
                        alt=""
                        id="svg-image"
                        className="object-cover w-full h-full text-blue-500"
                      />
                    </div>
                  )}
                </div>
                <div className="w-full">
                  <h2 className="text-xs sm:text-sm font-medium text-left text-gray-800 max-w-[95%] overflow-hidden">
                    {department.name}
                  </h2>
                </div>
                <div className="flex gap-3 mt-auto">
                  <button
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                    onClick={() => {
                      setSelectedDepartment(department);
                      setEditDepartmentModalOpen(true);
                    }}
                  >
                    <NotePencil size={18} />
                  </button>
                  <button className="text-gray-600 hover:text-gray-700 flex items-center gap-1 text-sm">
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
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
