import React, { useState } from 'react';
import {
  UserCircle,
  SignOut,
  MagnifyingGlass,
  Plus,
  PencilSimple,
  Trash,
  FirstAid,
} from 'phosphor-react';
import { deleteCookie } from 'cookies-next/client';
import { useRouter } from 'next/router';

const usersSample = [
  {
    id: 1,
    name: 'Алина Иванова',
    email: 'alina@mail.ru',
    role: 'Администратор',
    status: 'Активен',
  },
  {
    id: 2,
    name: 'Михаил Смирнов',
    email: 'mikhail@mail.ru',
    role: 'Пользователь',
    status: 'Заблокирован',
  },
  {
    id: 3,
    name: 'Ольга Петрова',
    email: 'olga@mail.ru',
    role: 'Пользователь',
    status: 'Активен',
  },
];

export default function AdminDashboard() {
  const [users] = useState(usersSample);
  const [search, setSearch] = useState('');
  const router = useRouter();

  // Filter users by search
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const logOut = () => {
    deleteCookie('authToken');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col text-gray-800 border-r border-gray-100">
        <div className="text-xl font-semibold p-6 text-gray-900">
          Дежурный доктор
        </div>
        <nav className="flex flex-col gap-1 px-4 flex-1">
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors duration-200 text-white">
            <UserCircle size={20} weight="bold" />
            <span className="text-sm">Пользователи</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors duration-200">
            <FirstAid size={20} weight="bold" className="text-gray-600" />
            <span className="text-sm text-gray-700">Отделения</span>
          </button>
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors duration-200"
            onClick={logOut}
          >
            <SignOut size={20} weight="bold" className="text-gray-600" />
            <span className="text-sm text-gray-700">Выйти</span>
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Управление пользователями
          </h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <MagnifyingGlass
                size={18}
                className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Поиск пользователей..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-sm"
              />
            </div>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors duration-200 text-sm">
              <Plus size={18} weight="bold" />
              Добавить пользователя
            </button>
          </div>
        </header>

        {/* Users table */}
        <div className="rounded-xl shadow-md bg-white border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-tight">
                  Имя
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-tight">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-tight">
                  Телефон
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-tight">
                  Роль
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-tight">
                  Специализация
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-tight">
                  График работы
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium tracking-tight">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 flex gap-2 items-center">
                      <UserCircle
                        size={24}
                        weight="regular"
                        className="text-gray-500"
                      />
                      <span className="text-sm">{user.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 text-sm">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 text-sm"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 text-sm">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 text-sm"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 text-sm"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          aria-label="Edit User"
                          className="text-blue-500 hover:text-blue-700 transition-colors duration-150"
                        >
                          <PencilSimple size={18} weight="bold" />
                        </button>
                        <button
                          aria-label="Delete User"
                          className="text-red-500 hover:text-red-700 transition-colors duration-150"
                        >
                          <Trash size={18} weight="bold" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-6 text-gray-600 font-medium text-sm"
                  >
                    Пользователи не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
