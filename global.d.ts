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

type DefaultSchedule = {
  id: number;
  user_id: number;
  start_time: string;
  end_time: string;
  day_of_week: string;
  is_day_off: boolean;
  created_at: string;
  user?: User;
};

type ScheduleOverride = {
  id: number;
  user_id: number;
  start_time: string;
  end_time: string;
  date: string;
  is_day_off: boolean;
  created_at: string;
  user?: User;
};

type ScheduleTimes = {
  start_time: string;
  end_time: string;
};

type UserWithSchedule = User & {
  schedule: ScheduleTimes
}

type NotificationPushToken = {
  id: number;
  user_id: number;
  push_token: string;
  device_type: string;
  deviceName: string;
  is_active: boolean;
  created_at: string;
};

type PushNotification = {
  id: number;
  consultation_id: number;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  is_sent: boolean;
  sent_at: string;
  read_at: string;
  created_at: string;
};