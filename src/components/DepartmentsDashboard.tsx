import Layout from './Layout';
import { fetcher } from '@/lib/fetcher';
import useSWR from 'swr';

import React from 'react';
import {
  ImageSquare,
  Trash,
  Image,
  NotePencil,
  PlusCircle,
} from 'phosphor-react';
import { CldImage } from 'next-cloudinary';

const DepartmentsDashboard = () => {
  const { data: departments, isLoading } = useSWR<Department[]>(
    `/api/departments`,
    fetcher
  );

  if (isLoading) {
    return <></>;
  }

  if (!departments) {
    return;
  }

  return (
    <Layout
      title="Отделения | Дежурный доктор"
      description="Управление отделениями больницы"
    >
      <div className="min-h-screen p-6">
        <div className="mb-6 flex justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              Панель отделений
            </h1>
            <p className="text-gray-500 text-sm">
              Управление списком отделений и их настройками
            </p>
          </div>
          <div>
            <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600">
              <PlusCircle size={24} />
              Добавить отделение
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {departments.map((department) => (
            <div
              key={department.id}
              className="bg-white shadow-lg rounded-2xl p-4 flex flex-col items-center gap-3 hover:shadow-xl transition-shadow relative"
            >
              <div className="relative py-4">
                {!department.photo_url ? (
                  <div className="w-8 h-8 flex justify-center items-center">
                    <Image className="text-gray-600" size={24} />
                  </div>
                ) : (
                  <div className="text-blue-600 w-10 h-10">
                    <CldImage
                      width="960"
                      height="600"
                      src={department.photo_url}
                      alt=""
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
              </div>

              <h3 className="text-sm font-medium text-center text-gray-800">
                {department.name}
              </h3>

              <div className="flex gap-3 mt-auto">
                <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm">
                  <NotePencil size={18} />
                </button>
                <button className="text-green-600 hover:text-green-800 flex items-center gap-1 text-sm">
                  <ImageSquare size={18} />
                </button>
                <button className="text-gray-600 hover:text-gray-700 flex items-center gap-1 text-sm">
                  <Trash size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default DepartmentsDashboard;
