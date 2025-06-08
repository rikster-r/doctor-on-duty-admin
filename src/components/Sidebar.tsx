import { FirstAid, SignOut, UserCircle, CalendarBlank } from 'phosphor-react';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Sidebar = () => {
  const { logout } = useUser();
  const router = useRouter();

  return (
    <aside className="w-72 bg-white shadow-lg flex flex-col text-gray-800 border-r border-gray-100 h-full">
      <div className="text-xl font-semibold p-6 text-blue-800 hidden lg:block">
        Дежурный доктор
      </div>
      <nav className="flex flex-col gap-1 px-4 flex-1 font-semibold">
        <Link
          href="/"
          className={`${
            router.pathname === '/'
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'hover:bg-blue-50'
          } flex items-center gap-3 px-4 py-3 rounded-xl`}
        >
          <UserCircle size={20} weight="bold" />
          <span className="text-sm">Пользователи</span>
        </Link>
        <Link
          href="/departments"
          className={`${
            router.pathname === '/departments'
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'hover:bg-blue-50'
          } flex items-center gap-3 px-4 py-3 rounded-xl`}
        >
          <FirstAid size={20} weight="bold" />
          <span className="text-sm">Отделения</span>
        </Link>
        <Link
          href="/schedules"
          className={`${
            router.pathname === '/schedules'
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'hover:bg-blue-50'
          } flex items-center gap-3 px-4 py-3 rounded-xl`}
        >
          <CalendarBlank size={20} weight="bold" />
          <span className="text-sm">Графики</span>
        </Link>
        <button
          onClick={logout}
          className={`hover:bg-blue-50 flex items-center gap-3 px-4 py-3 rounded-xl`}
        >
          <SignOut size={20} weight="bold" />
          <span className="text-sm">Выйти</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
