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

  const { doctorId, scheduleId } = req.query;

  if (!doctorId) {
    return res.status(400).json({ error: 'Отсутствует doctorId' });
  }

  if (!scheduleId) {
    return res.status(400).json({ error: 'Отсутствует scheduleId' });
  }

  if (req.method === 'PUT') {
    const { date, start_time, end_time } = req.body;

    if (!date || !start_time || !end_time) {
      return res.status(400).json({
        error: 'Отсутствуют необходимые поля для обновления оверрайда',
      });
    }

    try {
      const { data, error } = await supabase
        .from('schedule_overrides')
        .update({ date, start_time, end_time })
        .eq('id', scheduleId)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Ошибка сервера', error: (error as Error).message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('schedule_overrides')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      return res.status(204).end();
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Ошибка сервера', error: (error as Error).message });
    }
  }

  return res.status(405).json({ error: 'Метод не разрешен' });
}
