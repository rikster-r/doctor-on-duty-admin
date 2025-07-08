import { NextApiRequest, NextApiResponse } from 'next';
import createClient from '@/lib/postgre';
import { hash } from 'bcryptjs';
import { isUserAuthenticated } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createClient(req, res);
  const authenticated = isUserAuthenticated(req);
  if (!authenticated) {
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
      middle_name,
      last_name,
      phone_number,
      role,
      password,
      department_id,
      specialization,
    } = req.body;

    // Валидация данных
    if (
      role &&
      !['doctor', 'admin', 'head-doctor', 'head-admin'].includes(role)
    ) {
      return res.status(400).json({ error: 'Недопустимая роль' });
    }
    if (phone_number && !/^\+?[1-9]\d{1,14}$/.test(phone_number)) {
      return res.status(400).json({ error: 'Недопустимый номер телефона' });
    }

    const { error: updateError } = await supabase
      .from('users')
      .update([
        {
          ...(first_name && { first_name: first_name.trim() }),
          ...(middle_name && { middle_name: middle_name.trim() }),
          ...(last_name && { last_name: last_name.trim() }),
          ...(phone_number && { phone_number: phone_number.trim() }),
          ...(role && { role }),
          ...(password && { password_hash: await hash(password.trim(), 10) }),
        },
      ])
      .eq('id', userId);

    if (updateError) {
      return res
        .status(Number(updateError.code))
        .json({ error: updateError.message });
    }

    if (department_id || specialization) {
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
