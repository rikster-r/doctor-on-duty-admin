import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const user = getUserFromRequest(req);
      if (!user) {
        return res
          .status(401)
          .json({ error: 'Недействительный токен авторизации' });
      }

      return res.status(200).json({ user });
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
