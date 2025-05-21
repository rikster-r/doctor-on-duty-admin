import { CaretDown, Eye, EyeClosed } from 'phosphor-react';
import { useState } from 'react';

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
};

// main step of adding user with main data
const AddUserMainStep = ({ formData, setFormData }: Props) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement
  > = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div>
      <div className="mb-4 group">
        <label
          htmlFor="firstName"
          className="block font-medium mb-1 text-sm text-gray-700 group-focus-within:text-blue-800"
        >
          Имя
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          placeholder="Введите имя"
          value={formData.firstName}
          onChange={handleInputChange}
          className="peer w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
        />
      </div>
      <div className="mb-4 group">
        <label
          htmlFor="lastName"
          className="block font-medium mb-1 text-sm text-gray-700 group-focus-within:text-blue-800"
        >
          Фамилия
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          placeholder="Введите фамилию"
          value={formData.lastName}
          onChange={handleInputChange}
          className="peer w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
        />
      </div>
      <div className="mb-4 group">
        <label
          htmlFor="role"
          className="block font-medium mb-1 text-sm text-gray-700 group-focus-within:text-blue-800"
        >
          Роль
        </label>
        <div className="relative">
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
          >
            <option value="" disabled>
              Выберите роль
            </option>
            <option value="admin">Администратор</option>
            <option value="doctor">Доктор</option>
          </select>
          <CaretDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
          />
        </div>
      </div>
      <div className="mb-4 group">
        <label
          htmlFor="phoneNumber"
          className="block font-medium mb-1 text-sm text-gray-700 group-focus-within:text-blue-800"
        >
          Номер телефона
        </label>
        <input
          type="text"
          id="phoneNumber"
          name="phoneNumber"
          placeholder="+7"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          className="peer w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm"
        />
      </div>
      <div className="mb-4 group">
        <label
          htmlFor="password"
          className="block mb-1 font-medium text-gray-700 group-focus-within:text-blue-800"
        >
          Пароль
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            placeholder="Введите пароль"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white group-focus-within:outline-none group-focus-within:ring-2 group-focus-within:ring-blue-500 transition-all duration-200 text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
          </button>
        </div>
      </div>

      <button
        className="w-full bg-blue-500 text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition disabled:bg-gray-200 disabled:text-gray-500 disabled:hover:bg-gray-200"
        disabled={
          !formData.firstName ||
          !formData.lastName ||
          !formData.role ||
          !formData.phoneNumber ||
          !formData.password
        }
      >
        Продолжить
      </button>
    </div>
  );
};

export default AddUserMainStep;
