import { CaretDown } from 'phosphor-react';

type FormDataType = {
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber: string;
  password: string;
  specialization: string;
  departmentId: number;
};

type Props = {
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  departments: Department[];
};

const AddUserDoctorStep = ({ formData, setFormData, departments }: Props) => {
  const handleInputChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement
  > = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const skipStep = () => {
    setFormData((prev) => ({
      ...prev,
      departmentId: 0,
      specialization: '',
    }));
  };

  return (
    <div>
      <div className="mb-4 group">
        <label
          htmlFor="departmentId"
          className="block font-medium mb-1 text-sm text-gray-700 group-focus-within:text-blue-800"
        >
          Отделение
        </label>
        <div className="relative">
          <select
            id="departmentId"
            name="departmentId"
            value={formData.departmentId}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
          >
            <option value={0} disabled>
              Выберите отделение
            </option>
            {departments.map((department) => (
              <option value={department.id} key={department.id}>
                {department.name.charAt(0).toUpperCase() +
                  department.name.slice(1)}
              </option>
            ))}
          </select>
          <CaretDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
        </div>
      </div>
      <div className="mb-4 group">
        <label
          htmlFor="specialization"
          className="block font-medium mb-1 text-sm text-gray-700 group-focus-within:text-blue-800"
        >
          Специальность
        </label>
        <input
          type="text"
          id="specialization"
          name="specialization"
          placeholder="Введите имя"
          value={formData.specialization}
          onChange={handleInputChange}
          className="peer w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button
          className="w-full bg-white text-blue-500 border border-blue-500 font-semibold py-3 rounded-xl hover:text-blue-600 hover:border-blue-600 transition disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200"
          onClick={skipStep}
        >
          Пропустить
        </button>
        <button className="w-full bg-blue-500 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200">
          Добавить
        </button>
      </div>
    </div>
  );
};

export default AddUserDoctorStep;
