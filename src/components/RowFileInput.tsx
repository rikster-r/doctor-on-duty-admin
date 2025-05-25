import { useRef } from 'react';
import { toast } from 'react-toastify';

type Props = {
  name: string;
  file: File | null;
  setFile: (file: File) => void;
};

const acceptedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

export default function CustomFileInput({ name, file, setFile }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) {
      return;
    }

    const newFile = e.target.files[0];

    if (!acceptedFileTypes.includes(newFile.type)) {
      toast.error('Недопустимый тип файла');
    }

    setFile(newFile);
  };

  return (
    <div className="flex items-center rounded-md overflow-hidden border border-gray-300 max-w-xl">
      <button type="button" onClick={handleButtonClick} className="flex w-full">
        <p className="bg-blue-600 text-white text-sm hover:bg-blue-500 px-4 py-3">
          Обзор...
        </p>

        <p className="px-4 py-3 text-sm text-left text-gray-700 bg-gray-50 w-full truncate">
          {file ? file.name : 'Файл не выбран.'}
        </p>
      </button>
      <input
        id={name}
        name={name}
        type="file"
        accept={acceptedFileTypes.join(', ')}
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
