import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '@/lib/auth';
import createClient from '@/lib/postgre';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createClient(req, res);

  if (req.method === 'GET') {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res
          .status(401)
          .json({ error: 'Недействительный токен авторизации' });
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Ошибка получения пользователя:', error);
        return res.status(500).json({ error: 'Ошибка получения пользователя' });
      }

      return res.status(200).json({ user: userData });
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  } else if (req.method === 'DELETE') {
    res.setHeader(
      'Set-Cookie',
      `authToken=; ; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure`
    );
  }

  return res.status(405).json({ error: 'Метод не разрешен' });
}
