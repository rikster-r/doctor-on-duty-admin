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

  if (req.method === 'GET') {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res
        .status(400)
        .json({ error: 'Отсутствуют необходимые параметры' });
    }

    const userId = parseInt(doctorId as string, 10);
    const targetDate = date as string;
    const weekday = new Date(targetDate)
      .toLocaleDateString('en-US', {
        weekday: 'long',
      })
      .toLowerCase();

    try {
      // 1. Try to get schedule override
      const { data: override, error: overrideError } = await supabase
        .from('schedule_overrides')
        .select('*')
        .eq('user_id', userId)
        .eq('date', targetDate)
        .single();

      if (overrideError && overrideError.code !== 'PGRST116') {
        throw new Error(overrideError.message);
      }

      if (override) {
        return res.status(200).json(override);
      }

      // 2. Fallback to default schedule
      const { data: defaultSchedule, error: defaultError } = await supabase
        .from('default_schedules')
        .select('*')
        .eq('user_id', userId)
        .eq('day_of_week', weekday)
        .single();

      if (defaultError && defaultError.code !== 'PGRST116') {
        throw new Error(defaultError.message);
      }

      if (defaultSchedule) {
        return res.status(200).json({
          source: 'default',
          start_time: defaultSchedule.start_time,
          end_time: defaultSchedule.end_time,
        });
      }

      // 3. No schedule found
      return res.status(200).json({});
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Ошибка сервера', error: (error as Error).message });
    }
  }

  return res.status(405).json({ error: 'Метод не поддерживается' });
}
