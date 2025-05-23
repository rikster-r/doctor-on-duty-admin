import { useMemo, useState } from 'react';
import {
  UserCircle,
  MagnifyingGlass,
  Plus,
  PencilSimple,
  Trash,
} from 'phosphor-react';
import Layout from './Layout';
import { fetcher } from '@/lib/fetcher';
import useSWR from 'swr';
import Pagination from './Pagination';
import { toast } from 'react-toastify';
import AddUserModal from './modals/AddUserModal';
import EditUserModal from './modals/EditUserModal';
import { CldImage } from 'next-cloudinary';
import UserMenu from './UserMenu';
import ChangePasswordModal from './modals/ChangePasswordModal';
import ChangeImageModal from './modals/ChangeImageModal';

const pageSize = 50;

export default function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const {
    data,
    mutate: mutateUsers,
    isLoading,
  } = useSWR<UsersPanelData>(
    `/api/users?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(
      searchQuery
    )}`,
    fetcher,
    {
      keepPreviousData: true,
    }
  );
  const users = useMemo(() => (data ? data.users : []), [data]);
  const userCount = useMemo(() => (data ? data.totalUsers : 0), [data]);
  const { data: departments } = useSWR<Department[]>(
    `/api/departments`,
    fetcher
  );

  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [changeImageModalOpen, setChangeImageModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  console.log(users);

  const deleteUser = async (id: number) => {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error);
    } else {
      toast.success('Пользователь успешно удален');
      mutateUsers((currentData?: UsersPanelData) => {
        if (!currentData) return currentData;

        const filteredUsers = currentData.users.filter(
          (user) => user.id !== id
        );

        return {
          ...currentData,
          users: filteredUsers,
          totalUsers: currentData.totalUsers - 1,
        };
      });
    }
  };

  return (
    <Layout
      title="Панель пользователей"
      description="Контролируй пользователей приложения"
    >
      <main className="flex-1 p-2 lg:px-6 max-w-screen lg:max-w-[calc(100vw-var(--spacing)*72)]">
        {/* Управление */}
        <div className="flex flex-col p-2 mb-2">
          <div className="mb-2">
            <h2 className="text-lg font-semibold">Управление пользователями</h2>
          </div>
          <div className="relative mb-2">
            <MagnifyingGlass
              size={20}
              className="absolute top-1/2 left-3 transform -translate-y-1/2 text-blue-500"
              weight="bold"
            />
            <input
              type="text"
              placeholder="Поиск пользователей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm w-full pl-10 pr-4 py-3 rounded-xl border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            />
          </div>
          <div className="w-full flex">
            <button
              className="text-sm flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full transition-colors duration-200"
              onClick={() => setAddUserModalOpen(true)}
            >
              <Plus size={14} weight="bold" />
              Добавить пользователя
            </button>
          </div>
        </div>

        {/* Users table */}
        {/* Идет изначальная загрузка */}
        {isLoading && !searchQuery && (
          <div className="rounded-xl shadow-md bg-white border border-gray-100 overflow-auto">
            <p className="text-center py-6 text-gray-600 font-medium text-sm">
              Загрузка...
            </p>
          </div>
        )}
        {/* Не идет загрузка, либо идет загрузка от поиска */}
        {(!isLoading || (isLoading && searchQuery)) && (
          <div className="rounded-xl shadow-md bg-white border border-gray-100 overflow-auto">
            {users.length > 0 ? (
              <table className="divide-y divide-gray-100 w-full ">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-tight">
                      Имя
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-tight">
                      Телефон
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-tight">
                      Роль
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-tight">
                      Отделение
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-tight">
                      Специализация
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-tight">
                      График
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium tracking-tight">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800 flex gap-2 items-center">
                        <div className="w-10 h-10 rounded-full relative group">
                          {user.photo_url ? (
                            <CldImage
                              width="960"
                              height="600"
                              src={user.photo_url}
                              alt=""
                              className="rounded-full object-cover w-full h-full"
                            />
                          ) : (
                            <UserCircle
                              size={40}
                              weight="thin"
                              className="text-gray-500"
                            />
                          )}
                          <button
                            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setSelectedUser(user);
                              setChangeImageModalOpen(true);
                            }}
                          >
                            <PencilSimple
                              size={18}
                              weight="bold"
                              className="text-white"
                            />
                          </button>
                        </div>

                        <span className="text-sm">
                          {user.first_name} {user.last_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800 text-sm">
                        {user.phone_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800 text-sm">
                        {user.role === 'admin' ? 'Администратор' : 'Доктор'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800 text-sm">
                        {user.doctor_data?.department
                          ? user.doctor_data.department.name
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800 text-sm">
                        {user.doctor_data?.specialization
                          ? user.doctor_data.specialization
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800 text-sm"></td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            aria-label="Редактировать пользователя"
                            className="text-blue-500 hover:text-blue-700 transition-colors duration-150"
                            onClick={() => {
                              setSelectedUser(user);
                              setEditUserModalOpen(true);
                            }}
                          >
                            <PencilSimple size={18} weight="bold" />
                          </button>
                          <button
                            aria-label="Удалить пользователя"
                            className="text-red-500 hover:text-red-700 transition-colors duration-150"
                            onClick={() => deleteUser(user.id)}
                          >
                            <Trash size={18} weight="bold" />
                          </button>
                          <UserMenu
                            openChangePasswordModal={() => {
                              setSelectedUser(user);
                              setChangePasswordModalOpen(true);
                            }}
                            openChangeImageModal={() => {
                              setSelectedUser(user);
                              setChangeImageModalOpen(true);
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center py-6 text-gray-600 font-medium text-sm">
                Пользователи не найдены
              </p>
            )}
          </div>
        )}
        {userCount > pageSize && (
          <div className="mt-4 flex justify-end">
            <Pagination
              currentPage={page}
              totalPages={userCount}
              onPageChange={setPage}
            />
          </div>
        )}

        {addUserModalOpen && (
          <AddUserModal
            isOpen={addUserModalOpen}
            setIsOpen={setAddUserModalOpen}
            mutateUsers={mutateUsers}
            departments={departments ?? []}
          />
        )}
        {editUserModalOpen && selectedUser && (
          <EditUserModal
            isOpen={editUserModalOpen}
            setIsOpen={setEditUserModalOpen}
            user={selectedUser}
            mutateUsers={mutateUsers}
            departments={departments ?? []}
          />
        )}
        {changePasswordModalOpen && selectedUser && (
          <ChangePasswordModal
            isOpen={changePasswordModalOpen}
            setIsOpen={setChangePasswordModalOpen}
            user={selectedUser}
          />
        )}
        {changeImageModalOpen && selectedUser && (
          <ChangeImageModal
            isOpen={changeImageModalOpen}
            setIsOpen={setChangeImageModalOpen}
            user={selectedUser}
            mutateUsers={mutateUsers}
          />
        )}
      </main>
    </Layout>
  );
}
