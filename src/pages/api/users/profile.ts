import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromJwt } from '@/lib/getUserFromJWT';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const authToken = req.cookies.authToken;
      if (!authToken) {
        return res.status(401).json({ error: 'Войдите в аккаунт' });
      }
      const user = getUserFromJwt(authToken);
      if (!user) {
        return res.status(401).json('Недействительный токен авторизации');
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
