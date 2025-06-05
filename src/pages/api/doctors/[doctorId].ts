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
    const { doctorId } = req.query;

    if (!doctorId) {
      return res.status(400).json({ error: 'ID доктора обязателен' });
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select(
          '*, doctor_data:doctors(specialization, department:departments(id, name))'
        )
        .eq('id', doctorId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(400).json({ error: 'Доктор не найден' });
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

  return res.status(405).json({ error: 'Метод не разрешен' });
}
