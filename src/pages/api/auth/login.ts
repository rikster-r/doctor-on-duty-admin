import type { NextApiRequest, NextApiResponse } from 'next';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import createClient from '@/lib/postgre';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешен' });
  }

  const supabase = createClient(req, res)

  try {
    const { phone_number, password } = req.body;

    // Валидация входных данных
    if (!phone_number || !password) {
      return res.status(400).json({ error: 'Отсутствуют обязательные поля' });
    }
    if (!/^\+?[1-9]\d{1,14}$/.test(phone_number)) {
      return res.status(400).json({ error: 'Недопустимый номер телефона' });
    }

    // Поиск пользователя в базе данных
    const { data: userResult, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone_number', phone_number)
      .single();

    if (error || !userResult) {
      return res.status(401).json({ error: 'Неверный номер телефона или пароль' });
    }

    const user = userResult;

    // Проверка пароля
    const isPasswordValid = await compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный номер телефона или пароль' });
    }

    // Генерация JWT токена
    const token = jwt.sign(
      { userId: user.id, phone_number: user.phone_number, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Установка JWT в HTTP-only cookie
    res.setHeader(
      'Set-Cookie',
      `authToken=${token}; HttpOnly; Secure=${
        process.env.NODE_ENV === 'production'
      }; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`
    );

    // Успешный ответ
    return res.status(200).json({
      message: 'Вход выполнен успешно',
      user: { id: user.id, phone_number: user.phone_number, role: user.role },
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}