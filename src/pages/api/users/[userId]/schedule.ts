import { NextApiRequest, NextApiResponse } from 'next';
import createClient from '@/lib/postgre';
import { getUserFromRequest } from '@/lib/auth';

type POSTInput = {
  dates: Date[];
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

  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'Пользователь не указан' });
  }

  if (req.method === 'POST') {
    const { dates, start_time, end_time }: POSTInput = req.body;

    if (!dates || !dates.length || !start_time || !end_time) {
      return res.status(400).json({ error: 'Некорректные данные' });
    }

    if (start_time >= end_time) {
      return res.status(400).json({
        error: 'Конец смены должен быть позже начала.',
      });
    }

    console.log(dates);

    try {
      const { error } = await supabase.from('schedules').upsert(
        dates.map((date) => ({
          date,
          start_time,
          end_time,
          user_id: userId,
        })),
        {
          onConflict: 'date, user_id',
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      return res.status(201).json({ error: null });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Ошибка сервера', error: (error as Error).message });
    }
  } else if (req.method === 'DELETE') {
    const { dates }: { dates: string } = req.body;

    if (!dates || !Array.isArray(dates)) {
      return res.status(400).json({ error: 'Некорректные данные' });
    }

    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('user_id', userId)
        .in('date', dates);

      if (error) {
        throw new Error(error.message);
      }

      return res.status(200).json({ error: null });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Ошибка сервера', error: (error as Error).message });
    }
  } else if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }

      return res.status(200).json({ schedules: data });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Ошибка сервера', error: (error as Error).message });
    }
  }

  return res.status(405).json({ error: 'Метод не разрешен' });
}
