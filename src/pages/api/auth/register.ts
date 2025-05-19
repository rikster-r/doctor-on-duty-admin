import type { NextApiRequest, NextApiResponse } from 'next';
import { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import conn from '@/lib/postgre';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешен' });
  }

  try {
    const { phone_number, password, role } = req.body;

    // Валидация входных данных
    if (!phone_number || !password || !role) {
      return res.status(400).json({ error: 'Отсутствуют обязательные поля' });
    }
    if (!['doctor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Недопустимая роль' });
    }
    if (!/^\+?[1-9]\d{1,14}$/.test(phone_number)) {
      return res.status(400).json({ error: 'Недопустимый номер телефона' });
    }

    // Проверка существования пользователя
    const existingUser =
      await conn`SELECT id FROM users WHERE phone_number = ${phone_number}`;
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Пользователь уже существует' });
    }

    // Создать доктора, если роль доктор
    if (role === 'doctor') {
      // todo
    }

    // Хеширование пароля
    const hashedPassword = await hash(password, 10);

    // Вставка пользователя в базу данных
    const result = await conn`
      INSERT INTO users (phone_number, password_hash, role)
      VALUES (${phone_number}, ${hashedPassword}, ${role})
      RETURNING id, phone_number, role
    `;
    const user = result[0];

    // Генерация JWT токена
    const token = jwt.sign(
      { userId: user.id, phone_number: user.phone_number, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' } // Токен действителен 7 дней
    );

    // Установка JWT в HTTP-only cookie
    res.setHeader(
      'Set-Cookie',
      `token=${token}; HttpOnly; Secure=${
        process.env.NODE_ENV === 'production'
      }; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}; Path=/`
    );

    // Успешный ответ
    return res.status(200).json({
      message: 'Регистрация прошла успешно',
      user: { id: user.id, phone_number: user.phone_number, role: user.role },
    });
  } catch (error) {
    // Обработка ошибок
    console.error('Ошибка регистрации:', error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}