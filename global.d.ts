type User = {
  id: number;
  phone_number: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  password_hash: string;
  role: string;
  created_at: string;
  photo_url: string;
  doctor_data?: {
    specialization: string;
    department: { id: number; name: string };
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
  order: number;
  created_at: string;
};

type Schedule = {
  id: number;
  user_id: number;
  date: string; // 'YYYY-MM-DD'
  start_time: string; // 'HH:mm'
  end_time: string; // 'HH:mm'
  created_at: string;
};

type UserWithSchedule = User & {
  schedule?: {
    id: number;
    start_time: string; // 'HH:mm'
    end_time: string; // 'HH:mm'
  };
};

type DepartmentDateSchedule = { date: string; users: UserWithSchedule[] };

type NotificationPushToken = {
  id: number;
  user_id: number;
  push_token: string;
  device_type: string;
  deviceName: string;
  is_active: boolean;
  created_at: string;
};
