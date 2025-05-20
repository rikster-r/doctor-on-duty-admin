import { useState } from 'react';
import {
  UserCircle,
  MagnifyingGlass,
  Plus,
  PencilSimple,
  Trash,
} from 'phosphor-react';
import Layout from './Layout';

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

  // Filter users by search
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout
      title="Панель пользователей"
      description="Контролируй пользователей приложения"
    >
      <main className="flex-1 max-w-screen lg:max-w-[1200px] p-2 lg:px-6">
        {/* Controls */}
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm w-full pl-10 pr-4 py-2 rounded-xl border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            />
          </div>
          <div className="w-full flex">
            <button className="text-xs lg:text-sm flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full transition-colors duration-200">
              <Plus size={14} weight="bold" />
              Добавить пользователя
            </button>
          </div>
        </div>

        {/* Users table */}
        <div className="rounded-xl shadow-md bg-white border border-gray-100 overflow-auto">
          {filteredUsers.length > 0 ? (
            <table className="divide-y divide-gray-100 w-full">
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
                    График
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium tracking-tight">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => (
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
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center py-6 text-gray-600 font-medium text-sm">
              Пользователи не найдены
            </p>
          )}
        </div>
      </main>
    </Layout>
  );
}
