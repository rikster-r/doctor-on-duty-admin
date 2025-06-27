import { useMemo, useState } from 'react';
import {
  MagnifyingGlass,
  Plus,
  Trash,
  NotePencil,
  Share,
} from 'phosphor-react';
import Layout from './Layout';
import { fetcher } from '@/lib/fetcher';
import useSWR from 'swr';
import Pagination from './Pagination';
import { toast } from 'react-toastify';
import AddUserModal from './modals/AddUserModal';
import EditUserModal from './modals/EditUserModal';
import UserMenu from './UserMenu';
import ChangePasswordModal from './modals/ChangePasswordModal';
import ChangeImageModal from './modals/ChangeImageModal';
import UserImage from './UserImage';
import { useRouter } from 'next/router';

const pageSize = 50;

export default function UsersDashboard() {
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

  const router = useRouter();

  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [changeImageModalOpen, setChangeImageModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
      title="Панель пользователей | Дежурный доктор"
      description="Контролируй пользователей приложения"
    >
      <main className="flex-1 p-2 lg:px-6 max-w-screen lg:max-w-[calc(100vw-var(--spacing)*72)]">
        {/* Управление */}
        <div className="flex flex-col p-2 mb-2 max-w-[1200px] mx-auto">
          <div className="mb-4">
            <h1 className="text-lg font-semibold">Панель пользователей</h1>
            <p className="text-gray-500 text-sm">
              Создание и редактирование профилей и данных врачей
            </p>
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
          <div className="rounded-xl shadow-md bg-white border border-gray-100 overflow-auto max-w-[1200px] mx-auto">
            <p className="text-center py-6 text-gray-600 font-medium text-sm">
              Загрузка...
            </p>
          </div>
        )}
        {/* Не идет загрузка, либо идет загрузка от поиска */}
        {(!isLoading || (isLoading && searchQuery)) && (
          <div className="rounded-xl shadow-md bg-white border border-gray-100 overflow-auto max-w-[1200px] mx-auto">
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
                    <th className="px-6 py-3 text-center text-xs font-medium tracking-tight">
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
                        <UserImage
                          photoUrl={user.photo_url}
                          onEdit={() => {
                            setSelectedUser(user);
                            setChangeImageModalOpen(true);
                          }}
                        />
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
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800 text-sm text-center">
                        <button
                          aria-label="Редактировать пользователя"
                          className="text-blue-500 hover:text-blue-700 transition-colors duration-150 text-center"
                          onClick={() => {
                            router.push(`/schedules?doctorId=${user.id}`);
                          }}
                          title="Открыть страницу графика пользователя"
                        >
                          <Share size={18} weight="bold" />
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            aria-label="Редактировать пользователя"
                            className="text-blue-500 hover:text-blue-700 transition-colors duration-150"
                            onClick={() => {
                              setSelectedUser(user);
                              setEditUserModalOpen(true);
                            }}
                            title="Изменить обязательные данные пользователя"
                          >
                            <NotePencil size={18} weight="bold" />
                          </button>
                          <button
                            aria-label="Удалить пользователя"
                            className="text-red-500 hover:text-red-700 transition-colors duration-150"
                            onClick={() => deleteUser(user.id)}
                            title="Удалить пользователя"
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
          <div className="mt-4 flex justify-end max-w-[1200px] mx-auto">
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
