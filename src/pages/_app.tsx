import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Geist } from 'next/font/google';
import { Bounce, ToastContainer } from 'react-toastify';
import { UserProvider } from '@/hooks/useUser';

const geist = Geist({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <div className={`${geist.className} h-full relative`}>
        <Component {...pageProps} />
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          transition={Bounce}
          limit={4}
        />
      </div>
    </UserProvider>
  );
}
