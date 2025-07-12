import {
  Combobox,
  Transition,
  ComboboxButton,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react';
import { CaretDown, Check } from '@phosphor-icons/react';
import { Fragment, useState } from 'react';
import UserImage from './UserImage';

type Props = {
  doctors: User[] | undefined;
  selectedDoctorId: number | null;
  onDoctorChange: (doctor: User) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
};

const DoctorCombobox = ({
  doctors,
  selectedDoctorId,
  onDoctorChange,
  isLoading = false,
  placeholder = 'Выберите врача...',
  className = 'w-full',
}: Props) => {
  const [query, setQuery] = useState('');

  const selectedDoctor =
    doctors?.find((doctor) => doctor.id === selectedDoctorId) || null;

  const filteredDoctors =
    query === ''
      ? doctors || []
      : (doctors || []).filter((doctor) => {
          const fullName = `${doctor.first_name} ${doctor.last_name}`;
          const specialization = doctor.doctor_data?.specialization || '';
          const department = doctor.doctor_data?.department?.name || '';

          return (
            fullName.toLowerCase().includes(query.toLowerCase()) ||
            specialization.toLowerCase().includes(query.toLowerCase()) ||
            department.toLowerCase().includes(query.toLowerCase())
          );
        });

  const handleDoctorChange = (doctor: User | null) => {
    if (!doctor) return;
    onDoctorChange(doctor);
  };

  return (
    <div className={className}>
      <Combobox immediate value={selectedDoctor} onChange={handleDoctorChange}>
        <div className="relative">
          <ComboboxButton className="relative w-full cursor-default overflow-hidden text-left rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-sm">
            {selectedDoctor && (
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <UserImage photoUrl={selectedDoctor.photo_url} size={32} />
              </div>
            )}

            <ComboboxInput
              className={`w-full border-none px-4 py-4 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 focus:outline-none ${
                selectedDoctor ? 'pl-13' : 'pl-4'
              }`}
              displayValue={(doctor: User | null) =>
                doctor ? `${doctor.first_name} ${doctor.last_name}` : ''
              }
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
            />

            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <CaretDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
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
              ) : filteredDoctors.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                  Врач не найден.
                </div>
              ) : (
                filteredDoctors.map((doctor) => (
                  <ComboboxOption
                    key={doctor.id}
                    className={`relative cursor-default select-none py-3 pl-10 pr-4 data-focus:bg-blue-600 data-focus:text-white text-gray-900`}
                    value={doctor}
                  >
                    {({ selected, focus }) => (
                      <>
                        <div className="flex items-center">
                          <UserImage photoUrl={doctor.photo_url} size={32} />

                          <div className="ml-3 flex-1">
                            <div
                              className={`block truncate font-medium ${
                                selected ? 'font-semibold' : 'font-normal'
                              }`}
                            >
                              {doctor.first_name} {doctor.last_name}
                            </div>

                            {doctor.doctor_data && (
                              <div
                                className={`text-xs truncate ${
                                  focus ? 'text-blue-200' : 'text-gray-500'
                                }`}
                              >
                                {doctor.doctor_data.specialization}

                                {doctor.doctor_data.department &&
                                doctor.doctor_data.specialization
                                  ? ' •  '
                                  : ''}

                                {doctor.doctor_data.department.name}
                              </div>
                            )}
                          </div>
                        </div>

                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              focus ? 'text-white' : 'text-blue-600'
                            }`}
                          >
                            <Check className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
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

export default DoctorCombobox;
