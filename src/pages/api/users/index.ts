import { NextApiRequest, NextApiResponse } from 'next';
import createClient from '@/lib/postgre';
import { getUserFromJwt } from '@/lib/getUserFromJWT';
import { hash } from 'bcryptjs';

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
    const user = getUserFromJwt(token);
    if (!user) {
      return res.status(401).json({ error: 'Нет доступа' });
    }

    const { page = '1', size = '10', search = '' } = req.query;
    const pageNum = parseInt(page as string);
    const pageSize = parseInt(size as string);

    if (isNaN(pageNum) || isNaN(pageSize) || pageNum < 1 || pageSize < 1) {
      return res
        .status(400)
        .json({ message: 'Некорректные параметры пагинации' });
    }

    const from = (pageNum - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      let query = supabase
        .from('users')
        .select('*, doctors (specialization, photo_url)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .neq('id', user.id);

      if (search) {
        const searchTerm = `%${(search as string).toLowerCase()}%`;
        query = query.or(
          `phone_number.ilike.${searchTerm},first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`
        );
      }

      const { data, count, error } = await query.range(from, to);

      if (error) {
        throw new Error(error.message);
      }

      const totalPages = Math.ceil((count || 0) / pageSize);

      return res.status(200).json({
        users: data || [],
        currentPage: pageNum,
        totalPages,
        totalUsers: count || 0,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Server error', error: (error as Error).message });
    }
  } else if (req.method === 'POST') {
    try {
      console.log(req.body)
      const {
        first_name,
        last_name,
        phone_number,
        password,
        role,
        department_id,
        specialization,
      } = req.body;

      // Валидация обязательных данных
      if (!first_name || !last_name || !phone_number || !password || !role) {
        return res.status(400).json('Заполните все обязательные поля');
      }
      if (!['doctor', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Недопустимая роль' });
      }
      if (!/^\+?[1-9]\d{1,14}$/.test(phone_number)) {
        return res.status(400).json({ error: 'Недопустимый номер телефона' });
      }

      // Проверка существования пользователя
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('phone_number', phone_number);

      if (selectError) {
        console.error('Ошибка проверки пользователя:', selectError);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
      }

      if (existingUser && existingUser.length > 0) {
        return res
          .status(409)
          .json({
            error: 'Пользователь с данным номером телефона уже существует',
          });
      }

      // Валидация данных доктора
      if (role === 'doctor' && (!department_id || !specialization)) {
        return res.status(400).json({ error: 'Заполните данные доктора' });
      }

      const hashedPassword = await hash(password, 10);

      const { data: user, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            first_name,
            last_name,
            phone_number,
            password_hash: hashedPassword,
            role,
          },
        ])
        .select()
        .single();

      if (insertError || !user) {
        console.error('Ошибка вставки пользователя:', insertError);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
      }

      if (role === 'doctor') {
        const { error: insertError } = await supabase
          .from('doctors')
          .insert([{ user_id: user.id, department_id, specialization }]);

        if (insertError) {
          console.error(insertError);
          return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
      }

      return res.status(200).json({ user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }

  return res.status(405).json({ error: 'Метод не разрешен' });
}
