import {
  Combobox,
  Transition,
  ComboboxButton,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react';
import { CaretDownIcon, CheckIcon } from '@phosphor-icons/react';
import { Fragment, useState } from 'react';
import DepartmentImage from './DepartmentImage';

type Props = {
  departments: Department[] | undefined;
  selectedDepartmentId: number | null;
  onDepartmentChange: (departmentId: number | null) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
};

const DepartmentCombobox = ({
  departments,
  selectedDepartmentId,
  onDepartmentChange,
  isLoading = false,
  placeholder = 'Выберите отделение...',
  className = 'w-full sm:w-80',
}: Props) => {
  const [query, setQuery] = useState('');

  const selectedDepartment =
    departments?.find((department) => department.id === selectedDepartmentId) ||
    null;

  const filteredDepartments =
    query === ''
      ? departments || []
      : (departments || []).filter((department) => {
          const name = department.name || '';

          return name.toLowerCase().includes(query.toLowerCase());
        });

  const handleDepartmentChange = (department: Department | null) => {
    onDepartmentChange(department?.id || null);
  };

  return (
    <div className={className}>
      <Combobox
        immediate
        value={selectedDepartment}
        onChange={handleDepartmentChange}
      >
        <div className="relative">
          <ComboboxButton className="flex items-center relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300 sm:text-sm">
            {selectedDepartment && (
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <DepartmentImage
                  photoUrl={selectedDepartment.photo_url}
                  width={32}
                  height={32}
                />
              </div>
            )}

            <ComboboxInput
              className={`w-full border-none px-4 py-4 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 focus:outline-none ${
                selectedDepartment ? 'pl-13' : 'pl-4'
              }`}
              displayValue={(department: Department | null) =>
                department ? department.name : ''
              }
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <CaretDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
          </ComboboxButton>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery('')}
          >
            <ComboboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg focus:outline-none sm:text-sm z-10">
              {isLoading ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    <span>Загрузка...</span>
                  </div>
                </div>
              ) : filteredDepartments.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Отделение не найдено.
                </div>
              ) : (
                filteredDepartments.map((department) => (
                  <ComboboxOption
                    key={department.id}
                    className={`relative cursor-default select-none py-3 pl-10 pr-4 data-focus:bg-blue-500 data-focus:text-white text-gray-900`}
                    value={department}
                  >
                    {({ selected, focus }) => (
                      <>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              focus ? 'text-white' : 'text-blue-600'
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                        <div className="flex items-center">
                          <DepartmentImage
                            photoUrl={department.photo_url}
                            width={32}
                            height={32}
                          />
                          <div className="ml-3 flex-1">
                            <div
                              className={`text-sm block truncate font-medium ${
                                selected ? 'font-semibold' : 'font-normal'
                              }`}
                            >
                              {department.name}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </ComboboxOption>
                ))
              )}
            </ComboboxOptions>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
};

export default DepartmentCombobox;
