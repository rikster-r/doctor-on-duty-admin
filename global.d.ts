type User = {
  id: number;
  phone_number: string;
  first_name: string;
  last_name: string;
  password_hash: string;
  role: string;
  created_at: string;
  doctor_data?: {
    specialization: string;
    photo_url: string;
    department: { name: string };
  };
};

type UsersPanelData = {
  users: User[];
  currentPage: number;
  totalPages: number;
  totalUsers: number;
};

type Department = {
  id: number;
  name: string;
  photo_url: string;
  created_at: string;
};
