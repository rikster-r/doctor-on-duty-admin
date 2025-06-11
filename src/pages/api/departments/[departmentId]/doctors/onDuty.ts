import { NextApiRequest, NextApiResponse } from 'next';
import createClient from '@/lib/postgre';
import { getUserFromRequest } from '@/lib/auth';

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

  // Use provided date or default to today
  let targetDate: Date;
  let dateStr: string;

  if (date && typeof date === 'string') {
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res
        .status(400)
        .json({ error: 'Неверный формат даты. Используйте YYYY-MM-DD' });
    }

    targetDate = new Date(date);

    // Check if date is valid
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({ error: 'Неверная дата' });
    }

    dateStr = date;
  } else {
    targetDate = new Date();
    dateStr = targetDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  }

  const weekday = targetDate
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase(); // e.g. 'monday'

  try {
    // Step 1: Get doctors in department
    const { data: doctors, error: doctorError } = await supabase
      .from('users')
      .select(
        '*, doctor_data:doctors(specialization, department:departments(id, name))'
      )
      .eq('doctor_data.department.id', departmentId);

    if (doctorError) {
      throw new Error(doctorError.message);
    }

    if (!doctors || doctors.length === 0) {
      return res.status(404).json([]);
    }

    const userIds = doctors.map((doc) => doc.id);

    // Step 2 & 3: Get overrides and default schedules in parallel
    const [
      { data: overrides, error: overridesError },
      { data: defaults, error: defaultsError },
    ] = await Promise.all([
      supabase
        .from('schedule_overrides')
        .select('*')
        .in('user_id', userIds)
        .eq('date', dateStr),
      supabase
        .from('default_schedules')
        .select('*')
        .in('user_id', userIds)
        .eq('day_of_week', weekday)
        .neq('is_day_off', true),
    ]);

    if (!defaults || defaultsError) {
      throw new Error(defaultsError.message);
    }

    if (!overrides || overridesError) {
      throw new Error(overridesError.message);
    }

    // Step 4: Mark users who are working today
    const workingToday = new Map<
      number,
      { start_time: string; end_time: string }
    >();

    // supabase query doesn't include day_offs automatically
    defaults.forEach(({ user_id, start_time, end_time }) => {
      workingToday.set(user_id, { start_time, end_time });
    });

    overrides.forEach(({ user_id, is_day_off, start_time, end_time }) => {
      if (is_day_off) {
        workingToday.delete(user_id);
      } else {
        workingToday.set(user_id, { start_time, end_time });
      }
    });

    const onDutyDoctors = Array.from(
      workingToday.entries().map(([userId, schedule]) => {
        const doctor = doctors.find((doc) => doc.id === userId);
        return {
          id: userId,
          first_name: doctor?.first_name || '',
          last_name: doctor?.last_name || '',
          photo_url: doctor?.photo_url || '',
          doctor_data: {
            specialization: doctor?.doctor_data?.specialization || '',
            department: {
              id: doctor?.doctor_data?.department.id || 0,
              name: doctor?.doctor_data?.department.name || '',
            },
          },
          schedule: {
            start_time: schedule.start_time,
            end_time: schedule.end_time,
          },
        };
      })
    );

    return res.status(200).json(onDutyDoctors);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Ошибка сервера', error: (error as Error).message });
  }
}
