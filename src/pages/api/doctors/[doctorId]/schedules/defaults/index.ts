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

  const { doctorId } = req.query;

  if (!doctorId) {
    return res.status(400).json({ error: 'Отсутствует doctorId' });
  }

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('default_schedules')
        .select('*')
        .eq('user_id', doctorId);

      if (error) {
        if (error.code === 'PGRST116') {
          return res
            .status(400)
            .json({ error: 'Стандартный график этого доктора не найден' });
        }
        throw new Error(error.message);
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Ошибка сервера', error: (error as Error).message });
    }
  }

  if (req.method === 'POST') {
    const { day_of_week, is_day_off, start_time, end_time } = req.body;

    // allow either is_day_off or start_time and end_time
    if (!day_of_week || (is_day_off && (start_time || end_time))) {
      return res.status(400).json({
        error: 'Отсутствуют необходимые поля для создания расписания',
      });
    }

    try {
      if (is_day_off) {
        const { data, error } = await supabase
          .from('default_schedules')
          .insert([{ user_id: doctorId, day_of_week, is_day_off }])
          .select()
          .single();

        if (error) throw error;

        return res.status(201).json(data);
      } else {
        const { data, error } = await supabase
          .from('default_schedules')
          .insert([{ user_id: doctorId, day_of_week, start_time, end_time }])
          .select()
          .single();

        if (error) throw error;

        return res.status(201).json(data);
      }
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Ошибка сервера', error: (error as Error).message });
    }
  }

  return res.status(405).json({ error: 'Метод не разрешен' });
}
