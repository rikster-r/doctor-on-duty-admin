import { NextApiRequest, NextApiResponse } from 'next';
import createClient from '@/lib/postgre';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createClient(req, res);
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ error: 'Нет доступа' });
  }

  if (req.method === 'DELETE') {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'Некорректный айди пользователя' });
    }

    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (error) {
      return res.status(Number(error.code)).json({ error: error.message });
    }

    return res.status(200).json({ user: {} });
  }
}
