import { toast } from 'react-toastify';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { useMemo } from 'react';
import SortableDepartmentItem from './SortableDepartmentItem';
import { KeyedMutator } from 'swr';

type Props = {
  departments: Department[];
  setSelectedDepartment: (department: Department) => void;
  setEditDepartmentModalOpen: (open: boolean) => void;
  mutate: KeyedMutator<Department[]>;
};

export function DepartmentsSortableList({
  departments,
  setSelectedDepartment,
  setEditDepartmentModalOpen,
  mutate,
}: Props) {
  // departments are guaranteed to be sorted by order in backend
  const items = useMemo(() => departments.map((d) => d.id), [departments]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = departments.findIndex((d) => d.id === active.id);
    const newIndex = departments.findIndex((d) => d.id === over.id);
    const newItems = arrayMove(departments, oldIndex, newIndex);

    const reorderedDepartments = newItems.map((department, index) => ({
      ...department,
      order: index,
    }));

    // Оптимистичное обновление
    mutate(
      async () => {
        const res = await fetch('/api/departments/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            departments: reorderedDepartments.map(({ id, order }) => ({
              id,
              order,
            })),
          }),
        });

        if (!res.ok) {
          toast.error('Не удалось изменить порядок отделений');
          throw new Error('Не удалось изменить порядок отделений');
        }

        return reorderedDepartments;
      },
      {
        optimisticData: reorderedDepartments,
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      }
    );
  };

  const deleteDepartment = async (id: number) => {
    const res = await fetch(`/api/departments/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      toast.success('Отделение успешно удалено');
      mutate();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Ошибка при удалении отделения');
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={items}>
        <div className="grid grid-cols-3 gap-2">
          {departments.map((department) => (
            <SortableDepartmentItem
              key={department.id}
              department={department}
              setSelectedDepartment={setSelectedDepartment}
              setEditDepartmentModalOpen={setEditDepartmentModalOpen}
              deleteDepartment={deleteDepartment}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
