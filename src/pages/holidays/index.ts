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

  if (req.method === 'POST') {
    const { dates }: { dates: Date[] } = req.body;

    for (const date of dates) {
      if (!date) {
        return res.status(400).json({ error: 'Некорректные данные' });
      }
    }

    try {
      const { error } = await supabase.from('holidays').upsert(
        dates.map((date) => ({
          date: date.toISOString().split('T')[0], // 'YYYY-MM-DD'
        })),
        {
          onConflict: 'date',
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
        .from('holidays')
        .delete()
        .in('date', formattedDates); // 'YYYY-MM-DD'

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
    const { start, end } = req.query; // Dates in 'YYYY-MM-DD' format

    try {
      const { data, error } = await supabase
        .from('holidays')
        .select('*')
        .gte('date', start)
        .lte('date', end);

      if (error) {
        throw new Error(error.message);
      }

      return res.status(200).json({ data });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Ошибка сервера', error: (error as Error).message });
    }
  }

  return res.status(405).json({ error: 'Метод не разрешен' });
}
