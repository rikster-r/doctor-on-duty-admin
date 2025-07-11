import { useState, useRef, useCallback } from 'react';
import { Upload, X } from '@phosphor-icons/react';
import AvatarEditor from 'react-avatar-editor';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';

type FormDataType = {
  firstName: string;
  middleName: string;
  lastName: string;
  role: string;
  phoneNumber: string;
  password: string;
  specialization: string;
  departmentId: number;
  profileImage: File | null;
};

type Props = {
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
};

const allowedImageTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];

const AddUserImageStep = ({ formData, setFormData }: Props) => {
  const editorRef = useRef<AvatarEditor>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<File | null>(
    formData.profileImage ?? null
  );
  const onDrop = useCallback((files: File[]) => {
    if (files.length === 0) {
      return;
    }

    const file = files[0];

    if (!allowedImageTypes.includes(file.type)) {
      toast.error('Разрешены только картинки формата PNG, JPEG, WEBP или AVIF');
      return;
    }
    // 5mb
    if (file.size > 5242880) {
      toast.error('Максимальный размер картинки - 5мб');
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }
    if (!allowedImageTypes.includes(file.type)) {
      toast.error('Разрешены только картинки формата PNG, JPEG, WEBP или AVIF');
      return;
    }
    // 5mb
    if (file.size > 5242880) {
      toast.error('Максимальный размер картинки - 5мб');
      return;
    }
    setPreviewImage(file);
  };

  const removeImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveImage = () => {
    if (!editorRef.current || !previewImage) return;
    const canvas = editorRef.current.getImage();

    canvas.toBlob((blob) => {
      const file = new File([blob as Blob], previewImage.name, {
        type: 'image/png',
      });

      setFormData((prev) => ({ ...prev, profileImage: file }));
    }, 'image/png');
  };

  const skipStep = () => {
    setFormData((prev) => ({
      ...prev,
      profileImage: null,
    }));
  };

  return (
    <div>
      <div className="mb-4 group">
        <label
          htmlFor="profileImage"
          className="block font-medium mb-1 text-sm text-gray-700 group-focus-within:text-blue-800"
        >
          Фото доктора
        </label>

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
              className="absolute top-0 right-0 bg-blue-500 text-white"
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
                onChange={handleImageUpload}
                ref={fileInputRef}
                className="hidden"
                {...getInputProps()}
              />
            </label>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          className="w-full bg-white text-blue-500 border border-blue-500 font-semibold py-3 rounded-xl hover:text-blue-600 hover:border-blue-600 transition disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200"
          onClick={skipStep}
        >
          Пропустить
        </button>
        <button
          className="w-full bg-blue-500 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200"
          disabled={!previewImage}
          onClick={saveImage}
        >
          Продолжить
        </button>
      </div>
    </div>
  );
};

export default AddUserImageStep;
