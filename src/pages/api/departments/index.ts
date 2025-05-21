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

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase.from('departments').select('*');

      if (error) {
        return res.status(Number(error.code)).json({ error: error.message });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Server error', error: (error as Error).message });
    }
  }
}
