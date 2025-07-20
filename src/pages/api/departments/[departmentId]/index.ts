import { NextApiRequest, NextApiResponse } from 'next';
import createClient from '@/lib/postgre';
import formidable from 'formidable';
import cloudinary from '@/lib/cloudinary';
import { isUserAuthenticated } from '@/lib/auth';

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
  const authenticated = isUserAuthenticated(req);
  if (!authenticated) {
    return res.status(401).json({ error: 'Нет доступа' });
  }

  const { departmentId } = req.query;

  if (!departmentId) {
    return res.status(400).json({ error: 'Некорректный айди пользователя' });
  }

  if (req.method === 'PUT') {
    const form = formidable({ multiples: true });

    try {
      const {
        icon,
        name,
        phone_number,
      }: {
        icon: formidable.File | null;
        name: string | null;
        phone_number: string | null;
      } = await new Promise(function (resolve, reject) {
        form.parse(req, (err, fields, files) => {
          if (err) {
            reject(err);
            return;
          }

          resolve({
            icon: files.icon?.at(0) ?? null,
            name: Array.isArray(fields.name)
              ? fields.name[0]
              : fields.name ?? null,
            phone_number: Array.isArray(fields.phone_number)
              ? fields.phone_number[0]
              : fields.phone_number ?? null,
          });
        });
      });

      const updates: Record<string, File | string> = {};

      if (name) {
        updates.name = name;
      }

      if (icon) {
        const imageData = await cloudinary.uploader.upload(icon.filepath, {
          folder: 'doctoronduty/avatars',
          resource_type: 'image',
          public_id: icon.newFilename,
        });
        updates.photo_url = imageData.secure_url;
      }

      if (phone_number) {
        updates.phone_number = phone_number;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'Нет данных для обновления' });
      }

      const { data: department, error: updateError } = await supabase
        .from('departments')
        .update(updates)
        .eq('id', departmentId)
        .select()
        .single();

      if (updateError) {
        return res.status(500).json({ error: updateError.message });
      }

      return res.status(200).json({ department });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { data, error } = await supabase
        .from('departments')
        .delete()
        .eq('id', departmentId)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ошибка при удалении отдела' });
    }
  }
}
