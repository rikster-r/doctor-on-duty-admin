import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Geist } from 'next/font/google';

const geist = Geist({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={geist.className}>
      <Component {...pageProps} />
    </div>
  );
}
