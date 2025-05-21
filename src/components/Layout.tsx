import { useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import Sidebar from './Sidebar';
import Head from 'next/head';
import { List, X } from 'phosphor-react';

type Props = { children: React.ReactNode; title: string; description: string };

const Layout = ({ children, title, description }: Props) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head>
      <div className="flex flex-col lg:flex-row bg-[#ebf4fd] min-h-screen">
        <header className="lg:hidden w-full px-6 py-3 flex items-center bg-white text-blue-800 shadow sticky top-0 z-40">
          <div className="text-lg font-semibold">Дежурный доктор</div>
          <button className="ml-auto" onClick={openSidebar}>
            <List size={20} />
          </button>
          <Dialog
            as="div"
            className="relative z-50"
            onClose={closeSidebar}
            open={isSidebarOpen}
          >
            <DialogBackdrop className="fixed inset-0 bg-black/30" />
            <DialogPanel className="fixed inset-y-0 right-0 bg-white shadow-md">
              <div className="flex justify-end p-4">
                <button onClick={closeSidebar} className="text-gray-400">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <Sidebar />
            </DialogPanel>
          </Dialog>
        </header>

        <div className="hidden lg:block fixed h-full">
          <Sidebar />
        </div>

        <div className="flex w-full justify-center lg:ml-72 h-full">
          {children}
        </div>
      </div>
    </>
  );
};

export default Layout;
