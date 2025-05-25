import { NextApiRequest, NextApiResponse } from 'next';
import createClient from '@/lib/postgre';
import formidable from 'formidable';
import cloudinary from '@/lib/cloudinary';

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
  const token = req.cookies.authToken;
  if (!token) {
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
      }: {
        icon: formidable.File | null;
        name: string | null;
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
  }
}
