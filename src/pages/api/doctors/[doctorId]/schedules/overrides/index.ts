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
        .from('schedule_overrides')
        .select('*')
        .eq('user_id', doctorId);

      if (error) {
        if (error.code === 'PGRST116') {
          return res
            .status(400)
            .json({ error: 'График-оверрайд для этого доктора не найден' });
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
    const { date, is_day_off, start_time, end_time } = req.body;

    if (!date || (is_day_off && (start_time || end_time))) {
      return res
        .status(400)
        .json({ error: 'Отсутствуют необходимые поля для изменения графика' });
    }

    try {
      if (is_day_off) {
        const { data, error } = await supabase
          .from('schedule_overrides')
          .upsert([{ user_id: doctorId, date, is_day_off }], {
            onConflict: 'user_id,date',
            ignoreDuplicates: false,
          });

        if (error) throw error;

        return res.status(201).json(data);
      } else {
        const { data, error } = await supabase
          .from('schedule_overrides')
          .upsert([{ user_id: doctorId, date, start_time, end_time }], {
            onConflict: 'user_id,date',
            ignoreDuplicates: false,
          });

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
