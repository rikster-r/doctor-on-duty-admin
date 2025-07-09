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
    const departmentId = req.query.departmentId as string;
    const start = req.query.start as string;
    const end = req.query.end as string;

    if (!departmentId || !start || !end) {
      return res.status(400).json({ error: 'Отсутствуют параметры запроса' });
    }

    // Validate date format
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ error: 'Неверный формат даты' });
    }

    if (startDate > endDate) {
      return res
        .status(400)
        .json({ error: 'Дата начала не может быть больше даты окончания' });
    }

    // Fetch schedules for the department within the specified date range
    try {
      const { data, error } = await supabase.rpc('get_department_schedules', {
        dept_id: departmentId,
        start_date: start,
        end_date: end,
      });

      if (error) {
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
}
