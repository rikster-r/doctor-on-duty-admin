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

  if (req.method === 'DELETE') {
    try {
      const { consultationId } = req.query;

      const { error } = await supabase
        .from('consultations')
        .delete()
        .eq('id', consultationId);

      if (error) {
        throw new Error(error.message);
      }

      res.status(200).json({ error: null });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Ошибка сервера', error: (error as Error).message });
    }
  }

  return res.status(405).json({ error: 'Метод не разрешен' });
}
