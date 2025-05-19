import { useRouter } from 'next/router';
import { createContext, useContext } from 'react';
import useSWR from 'swr';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isLoading: boolean;
  error: unknown;
}

const UserContext = createContext<UserContextType | null>(null);

type ProviderProps = {
  children: React.ReactNode;
};

const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Не удалось найти пользователя');
  return res.json();
};

export const UserProvider = ({ children }: ProviderProps) => {
  const { data, mutate, error, isLoading } = useSWR<{ user: User }>(
    '/api/users/profile',
    fetcher
  );
  const router = useRouter();

  const login = (userData: User, redirectTo = '/') => {
    mutate({ user: userData }).then(() => {
      // Не работает без перезагрузки router
      // https://github.com/vercel/next.js/discussions/51782
      router.reload();
      router.push(redirectTo);
    });
  };

  const logout = async () => {
    await fetch('/api/users/profile', { method: 'DELETE' });
    mutate(undefined).then(() => {
      router.reload();
      router.push('/login');
    });
  };
  const currentUser = data ? data.user : null;

  return (
    <UserContext.Provider
      value={{ user: currentUser, login, logout, isLoading, error }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
