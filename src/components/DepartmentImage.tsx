import { ImageSquareIcon } from '@phosphor-icons/react';
import { CldImage } from 'next-cloudinary';

interface DepartmentImageProps {
  photoUrl: string | null;
  width?: number;
  height?: number;
}

export default function DepartmentImage({
  photoUrl,
  width = 40,
  height = 40,
}: DepartmentImageProps) {
  return (
    <div
      className="flex items-center"
      style={{
        width,
        height,
      }}
    >
      {photoUrl ? (
        <div
          className="text-blue-600 mr-auto w-full h-full"
          style={{
            width,
            height,
          }}
        >
          <CldImage
            width="800"
            height="800"
            src={photoUrl}
            alt=""
            className="object-cover w-full h-full text-blue-500"
            id="svg-image"
          />
        </div>
      ) : (
        <ImageSquareIcon
          className="text-gray-600 mx-auto"
          size={Math.min(width, height) / 2}
        />
      )}
    </div>
  );
}
