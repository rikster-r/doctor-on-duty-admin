import { NextApiRequest, NextApiResponse } from 'next';
import createClient from '@/lib/postgre';
import { getUserFromRequest } from '@/lib/auth';

type ReturnData = {
  id: number;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  specialization: string;
  department_id: number;
  department_name: string;
  start_time: string;
  end_time: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createClient(req, res);
  const user = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Нет доступа' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  const { departmentId, date } = req.query;

  if (!departmentId) {
    return res.status(400).json({ error: 'Отсутствует departmentId' });
  }

  // Validate date format if provided
  let targetDate: string | undefined;
  if (date && typeof date === 'string') {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res
        .status(400)
        .json({ error: 'Неверный формат даты. Используйте YYYY-MM-DD' });
    }

    // Check if date is valid
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Неверная дата' });
    }

    targetDate = date;
  }

  try {
    const { data: doctorsOnDuty, error } = await supabase.rpc(
      'get_doctors_on_duty',
      {
        p_department_id: Number(departmentId),
        p_date: targetDate, // If undefined, RPC will use CURRENT_DATE
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    const formattedDoctors: UserWithSchedule[] = (doctorsOnDuty || []).map(
      (doctor: ReturnData) => ({
        id: doctor.id,
        first_name: doctor.first_name,
        last_name: doctor.last_name,
        photo_url: doctor.photo_url,
        doctor_data: {
          specialization: doctor.specialization,
          department: {
            id: doctor.department_id,
            name: doctor.department_name,
          },
        },
        schedule: {
          start_time: doctor.start_time,
          end_time: doctor.end_time,
        },
      })
    );

    return res.status(200).json(formattedDoctors);
  } catch (error) {
    console.error('Error fetching doctors on duty:', error);
    return res.status(500).json({
      message: 'Ошибка сервера',
      error: (error as Error).message,
    });
  }
}
