import { NextApiRequest, NextApiResponse } from 'next';
import createClient from '@/lib/postgre';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Метод не разрешен' });

  const supabase = createClient(req, res);
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ error: 'Нет доступа' });
  }

  const { departments } = req.body;

  if (!Array.isArray(departments)) {
    return res.status(400).json({ error: 'Неверный формат данных' });
  }

  try {
    const updates = departments.map(
      ({ id, order }: { id: number; order: number }) =>
        supabase.from('departments').update({ order }).eq('id', id)
    );

    const results = await Promise.all(updates);

    const hasError = results.some((result) => result.error);

    if (hasError) {
      console.error('One or more updates failed', results);
      return res.status(500).json({ error: 'Ошибка при обновлении порядка' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка сервера при изменении порядка' });
  }
}
