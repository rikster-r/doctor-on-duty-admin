import { Dialog, DialogPanel, DialogBackdrop } from '@headlessui/react';

type Props = {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const BaseModal = ({ children, isOpen, setIsOpen }: Props) => {
  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
      <DialogBackdrop className="fixed inset-0 bg-gray-900/60 z-60" />

      <div className="fixed inset-0 flex items-center justify-center p-4 z-70">
        <DialogPanel
          className={`bg-white rounded-xl shadow-lg overflow-auto w-full max-w-md`}
        >
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default BaseModal;
