import { NextApiRequest, NextApiResponse } from 'next';
import createClient from '@/lib/postgre';
import { hash } from 'bcryptjs';
import cloudinary from '@/lib/cloudinary';
import formidable from 'formidable';
import { getUserFromRequest } from '@/lib/auth';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createClient(req, res);
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Нет доступа' });
  }

  if (req.method === 'GET') {
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
      const query = supabase
        .from('users')
        .select(
          '*, doctor_data:doctors(specialization, department:departments(id, name))',
          {
            count: 'exact',
          }
        )
        .order('created_at', { ascending: false })
        .neq('id', user.id);

      if (search) {
        const searchTerms = (search as string)
          .toLowerCase()
          .split(' ')
          .filter((term) => term.trim() !== '')
          .map((term) => `%${term}%`);

        query.or(
          searchTerms
            .map((term) =>
              ['phone_number', 'first_name', 'last_name']
                .map((field) => `${field}.ilike.${term}`)
                .join(',')
            )
            .join(',')
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
    const form = formidable({ multiples: true });

    try {
      // Парсинг
      const {
        first_name,
        middle_name,
        last_name,
        phone_number,
        password,
        role,
        department_id,
        specialization,
        profile_image,
      }: {
        first_name: string;
        middle_name: string;
        last_name: string;
        phone_number: string;
        password: string;
        role: string;
        department_id: number;
        specialization: string;
        profile_image: formidable.File | null;
      } = await new Promise(function (resolve, reject) {
        form.parse(req, (err, fields, files) => {
          if (err) {
            reject(err);
            return;
          }

          resolve({
            first_name: fields.first_name?.at(0)?.trim() ?? '',
            middle_name: fields.middle_name?.at(0)?.trim() ?? '',
            last_name: fields.last_name?.at(0)?.trim() ?? '',
            phone_number: fields.phone_number?.at(0)?.trim() ?? '',
            password: fields.password?.at(0)?.trim() ?? '',
            role: fields.role?.at(0) ?? '',
            department_id: Number(fields.department_id?.at(0)) ?? 0,
            specialization: fields.specialization?.at(0)?.trim() ?? '',
            profile_image: files.profile_image?.at(0) ?? null,
          });
        });
      });

      // Валидация обязательных данных
      if (!first_name || !last_name || !phone_number || !password || !role) {
        return res.status(400).json('Заполните все обязательные поля');
      }
      if (!['doctor', 'admin', 'head-doctor'].includes(role)) {
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
        return res.status(409).json({
          error: 'Пользователь с данным номером телефона уже существует',
        });
      }

      // Валидация данных доктора
      if (role === 'doctor' && (!department_id || !specialization)) {
        return res.status(400).json({ error: 'Заполните данные доктора' });
      }

      const hashedPassword = await hash(password, 10);

      // Сохранение картинки
      let imageData;
      if (profile_image) {
        imageData = await cloudinary.uploader.upload(profile_image.filepath, {
          folder: 'doctoronduty/avatars',
          resource_type: 'image',
          public_id: profile_image.newFilename,
        });
      }

      const { data: user, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            first_name,
            ...(middle_name && { middle_name }),
            last_name,
            phone_number,
            password_hash: hashedPassword,
            role,
            photo_url: imageData?.secure_url ?? null,
          },
        ])
        .select()
        .single();

      if (insertError || !user) {
        console.error('Ошибка вставки пользователя:', insertError);
        return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
      }

      if (department_id || specialization) {
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
