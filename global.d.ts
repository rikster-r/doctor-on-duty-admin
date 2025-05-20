type User = {
  id: number;
  phone_number: string;
  first_name: string;
  last_name: string;
  password_hash: string;
  role: string;
  created_at: string;
  specialization?: string;
  photo_url?: string;
};
