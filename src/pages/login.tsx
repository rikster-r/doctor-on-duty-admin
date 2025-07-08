import { useState } from 'react';
import { Eye, EyeClosed } from 'phosphor-react';
import { toast } from 'react-toastify';
import { useUser } from '@/hooks/useUser';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';

export const getServerSideProps = (context: GetServerSidePropsContext) => {
  const authToken = context.req.cookies.authToken;

  if (authToken) {
    return {
      redirect: {
        destination: '/',
        permanent: true,
      },
    };
  }

  return {
    props: {},
  };
};

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useUser();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Ошибка входа');
        return;
      }

      if (data.user.role !== 'admin' && data.user.role !== 'head-admin') {
        toast.error('Вы не являетесь администратором');
        return;
      }

      login(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Head>
        <title>Войдите в аккаунт</title>
        <meta
          name="description"
          content={`Войдите в аккаунт админ панели "Дежурный доктор"`}
        />
      </Head>
      <div className="flex justify-center items-center h-full bg-[#ebf4fd] ">
        <form
          className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-2 "
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
            Вход
          </h2>
          <div className="mb-4 group">
            <label
              htmlFor="phoneNumber"
              className="block font-medium mb-1 text-gray-700 group-focus-within:text-blue-800"
            >
              Номер телефона
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              placeholder="+7"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="peer w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
            />
          </div>
          <div className="mb-4 group">
            <label
              htmlFor="password"
              className="block mb-1 font-medium text-gray-700 group-focus-within:text-blue-800 "
            >
              Пароль
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
              </button>
            </div>
          </div>
          <button
            className="w-full bg-blue-500 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200"
            disabled={!phoneNumber || !password}
          >
            Далее
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;
