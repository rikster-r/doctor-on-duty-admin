import { DialogTitle } from '@headlessui/react';
import { useState, useRef, useCallback } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { useDropzone } from 'react-dropzone';
import { Upload, X, CaretLeft } from '@phosphor-icons/react';
import { toast } from 'react-toastify';
import { KeyedMutator } from 'swr';
import BaseModal from './BaseModal';

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: User;
  mutateUsers: KeyedMutator<UsersPanelData>;
};

const allowedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];

const ChangeImageModal = ({ isOpen, setIsOpen, user, mutateUsers }: Props) => {
  const editorRef = useRef<AvatarEditor>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<File | null>(null);

  const onDrop = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (!allowedImageTypes.includes(file.type)) {
      toast.error('Только PNG, JPEG, WEBP, AVIF разрешены');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Максимальный размер — 5MB');
      return;
    }

    setPreviewImage(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
      'image/avif': ['.avif'],
    },
  });

  const saveImage = () => {
    if (!editorRef.current || !previewImage) return;

    const canvas = editorRef.current.getImage();
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], previewImage.name, { type: 'image/png' });
      const formDataToSend = new FormData();
      formDataToSend.append('profile_image', file);

      const res = await fetch(`/api/users/${user.id}/profileImage`, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (res.ok) {
        mutateUsers();
        toast.success('Фото успешно обновлено');
        setIsOpen(false);
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    }, 'image/png');
  };

  const removeImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <BaseModal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="bg-white p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <CaretLeft className="invisible" size={20} />
          <DialogTitle className="text-base font-bold text-center text-gray-800">
            Изменить фото
          </DialogTitle>
          <button onClick={() => setIsOpen(false)} type="button">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4">
          {previewImage ? (
            <div className="mb-4 relative border-2 border-blue-500 w-full aspect-square">
              <AvatarEditor
                ref={editorRef}
                image={previewImage}
                width={1000}
                height={1000}
                className="dark:bg-neutral-900 max-w-full max-h-full z-50"
                border={0}
                scale={1}
              />
              <div className="border-blue-500 border-2 rounded-full h-full w-full absolute top-0 pointer-events-none"></div>
              <button
                className="absolute top-0 right-0 bg-blue-500 text-white rounded-full p-1"
                onClick={removeImage}
              >
                <X size={25} />
              </button>
            </div>
          ) : (
            <div
              className="flex items-center justify-center w-full"
              {...getRootProps()}
            >
              <label
                htmlFor="profileImage"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                  <Upload size={32} className="text-gray-500 mb-2" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Нажмите для загрузки</span>{' '}
                    или перетащите файл
                  </p>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, WEBP, AVIF (макс. 5MB)
                  </p>
                </div>
                <input
                  id="profileImage"
                  type="file"
                  accept={allowedImageTypes.join(', ')}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onDrop([file]);
                  }}
                  ref={fileInputRef}
                  className="hidden"
                  {...getInputProps()}
                />
              </label>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-white text-blue-500 border border-blue-500 font-semibold py-3 rounded-xl hover:text-blue-600 hover:border-blue-600 transition disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200"
            >
              Отмена
            </button>
            <button
              className="w-full bg-blue-500 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200"
              disabled={!previewImage}
              onClick={saveImage}
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default ChangeImageModal;
