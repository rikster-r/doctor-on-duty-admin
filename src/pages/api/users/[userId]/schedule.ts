import { NextApiRequest, NextApiResponse } from 'next';
import createClient from '@/lib/postgre';
import { getUserFromRequest } from '@/lib/auth';

type ScheduleInput = {
  date: Date; // 'YYYY-MM-DD'
  start_time: Date; // 'HH:mm'
  end_time: Date; // 'HH:mm'
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
    const { schedules }: { schedules: ScheduleInput[] } = req.body;

    for (const { date, start_time, end_time } of schedules) {
      if (!date || !start_time || !end_time) {
        return res.status(400).json({ error: 'Некорректные данные' });
      }

      if (start_time >= end_time) {
        return res
          .status(400)
          .json({ error: 'Время начала должно быть меньше времени окончания' });
      }
    }

    try {
      const { error } = await supabase.from('schedules').upsert(
        schedules.map((schedule) => ({
          date: schedule.date.toISOString().split('T')[0], // 'YYYY-MM-DD'
          start_time: schedule.start_time
            .toISOString()
            .split('T')[1]
            .slice(0, 5), // 'HH:mm'
          end_time: schedule.end_time.toISOString().split('T')[1].slice(0, 5), // 'HH:mm'
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
    const { dates }: { dates: Date[] } = req.body;

    if (!dates || !Array.isArray(dates)) {
      return res.status(400).json({ error: 'Некорректные данные' });
    }

    const formattedDates = dates.map(
      (date) => date.toISOString().split('T')[0]
    );

    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('user_id', userId)
        .in(
          'date',
          formattedDates // 'YYYY-MM-DD'
        );

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
