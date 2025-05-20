import { FirstAid, SignOut, UserCircle } from 'phosphor-react';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';

const Sidebar = () => {
  const { logout } = useUser();

  return (
    <aside className="w-72 bg-white shadow-lg flex flex-col text-gray-800 border-r border-gray-100 h-full">
      <div className="text-xl font-semibold p-6 text-blue-800 hidden lg:block">
        Дежурный доктор
      </div>
      <nav className="flex flex-col gap-1 px-4 flex-1 font-semibold">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors duration-200 text-white"
        >
          <UserCircle size={20} weight="bold" />
          <span className="text-sm">Пользователи</span>
        </Link>
        <Link
          href="/departments"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors duration-200"
        >
          <FirstAid size={20} weight="bold" className="text-gray-600" />
          <span className="text-sm text-gray-700">Отделения</span>
        </Link>
        <button
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors duration-200"
          onClick={logout}
        >
          <SignOut size={20} weight="bold" className="text-gray-600" />
          <span className="text-sm text-gray-700">Выйти</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
