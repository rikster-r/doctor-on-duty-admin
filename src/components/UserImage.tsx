import { CldImage } from 'next-cloudinary';
import { PencilSimple, UserCircle } from '@phosphor-icons/react';

type Props = {
  photoUrl: string | undefined | null;
  onEdit?: () => void;
  size?: number;
};

export default function UserImage({ photoUrl, onEdit, size = 40 }: Props) {
  return (
    <div
      className={`rounded-full relative group`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {photoUrl ? (
        <CldImage
          width="600"
          height="600"
          src={photoUrl}
          alt=""
          className="rounded-full object-cover w-full h-full"
        />
      ) : (
        <UserCircle size={size} weight="thin" className="text-gray-500" />
      )}
      {onEdit && (
        <button
          className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onEdit}
        >
          <PencilSimple
            size={Math.floor(size * 0.45)}
            weight="bold"
            className="text-white"
          />
        </button>
      )}
    </div>
  );
}
