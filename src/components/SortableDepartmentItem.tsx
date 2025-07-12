import { useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CldImage } from 'next-cloudinary';
import {
  ImageSquare,
  NotePencil,
  Trash,
  DotsSixVertical,
  CalendarBlankIcon,
} from '@phosphor-icons/react';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/router';

type Props = {
  department: Department;
  setSelectedDepartment: (department: Department) => void;
  setEditDepartmentModalOpen: (open: boolean) => void;
  openDeleteConfirmModal: () => void;
};

export default function SortableDepartmentItem({
  department,
  setSelectedDepartment,
  setEditDepartmentModalOpen,
  openDeleteConfirmModal,
}: Props) {
  const { user } = useUser();
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkIsMobile = () =>
      setIsMobile(window.matchMedia('(max-width: 640px)').matches);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: department.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : 'auto',
    opacity: isDragging ? 0.95 : 1,
    scale: isDragging ? 1.02 : 1,
    cursor: isDragging ? 'grabbing' : isMobile ? 'grab' : 'default',
  };

  if (!user) return <></>;

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`${
          user.role === 'head-admin' ? 'hover:shadow-2xl hover:scale-105' : ''
        } min-h-[140px] sm:min-h-[150px] bg-white shadow-lg rounded-2xl p-3 sm:px-6 flex flex-col items-center gap-3 transition-shadow relative`}
        {...(isMobile && user.role === 'head-admin'
          ? { ...attributes, ...listeners }
          : {})} // Перетаскивание через любую точку на диве на телефоне
      >
        {/* Перетаскивание через кнопку на десктопе*/}
        {!isMobile && user.role === 'head-admin' && (
          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 right-2 cursor-grab text-gray-400 hover:text-gray-600"
            title="Перетаскивай, чтобы изменить расположение"
          >
            <DotsSixVertical size={20} weight="bold" />
          </div>
        )}

        <div className="relative w-full pointer-events-none">
          {!department.photo_url ? (
            <div className="w-10  h-10 sm:w-12 sm:h-12 flex items-center ">
              <ImageSquare className="text-gray-600" size={24} />
            </div>
          ) : (
            <div className="text-blue-600 w-10 h-10 sm:w-12 sm:h-12 mr-auto">
              <CldImage
                width="800"
                height="800"
                src={department.photo_url}
                alt=""
                id="svg-image"
                className="object-cover w-full h-full text-blue-500"
              />
            </div>
          )}
        </div>
        <div className="w-full">
          <h2 className="text-[11px] sm:text-sm font-medium text-left text-gray-800">
            {department.name}
          </h2>
        </div>
        {user.role === 'head-admin' && (
          <div className="flex gap-3 mt-auto">
            <button
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              onClick={() => {
                setSelectedDepartment(department);
                setEditDepartmentModalOpen(true);
              }}
              title="Редактировать данные отделения"
            >
              <NotePencil size={18} weight="bold" />
            </button>
            <button
              aria-label="Редактировать пользователя"
              className="text-blue-600 hover:text-blue-700 text-center"
              onClick={() => {
                router.push(`/schedules?departmentId=${department.id}`);
              }}
              title="Открыть графики отделения"
            >
              <CalendarBlankIcon size={18} weight="bold" />
            </button>
            <button
              className="text-gray-600 hover:text-gray-700 flex items-center gap-1"
              onClick={openDeleteConfirmModal}
              title="Удалить отделение"
            >
              <Trash size={18} weight="bold" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
