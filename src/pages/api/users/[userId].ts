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

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Некорректный айди пользователя' });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (error) {
      return res.status(Number(error.code)).json({ error: error.message });
    }

    return res.status(200).json({ user: {} });
  } else if (req.method === 'PUT') {
    const {
      first_name,
      last_name,
      phone_number,
      role,
      department_id,
      specialization,
    } = req.body;

    // Валидация данных
    if (role && !['doctor', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Недопустимая роль' });
    }
    if (!/^\+?[1-9]\d{1,14}$/.test(phone_number)) {
      return res.status(400).json({ error: 'Недопустимый номер телефона' });
    }

    const { error: updateError } = await supabase
      .from('users')
      .update([
        {
          ...(first_name && { first_name }),
          ...(last_name && { last_name }),
          ...(phone_number && { phone_number }),
          ...(role && { role }),
        },
      ])
      .eq('id', userId);

    if (updateError) {
      return res
        .status(Number(updateError.code))
        .json({ error: updateError.message });
    }

    // Удалить данные доктора если он изменяется на администратора
    if (role === 'admin') {
      const { error: doctorDeleteError } = await supabase
        .from('doctors')
        .delete()
        .eq('user_id', userId);

      if (doctorDeleteError) {
        return res
          .status(Number(doctorDeleteError.code))
          .json({ error: doctorDeleteError.message });
      }
    } else if (role === 'doctor' && (department_id || specialization)) {
      const { error: doctorUpdateError } = await supabase
        .from('doctors')
        .upsert(
          [
            {
              user_id: userId,
              ...(department_id && { department_id }),
              ...(specialization && { specialization }),
            },
          ],
          { onConflict: 'user_id', ignoreDuplicates: false }
        );

      if (doctorUpdateError) {
        return res
          .status(Number(doctorUpdateError.code))
          .json({ error: doctorUpdateError.message });
      }
    }

    return res
      .status(204)
      .json({ message: 'Данные пользователя успешно обновлены' });
  }

  return res.status(405).json({ error: 'Метод не разрешен' });
}
