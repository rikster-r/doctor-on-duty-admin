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

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('order', { ascending: true });

      if (error) {
        return res.status(Number(error.code)).json({ error: error.message });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Server error', error: (error as Error).message });
    }
  }

  if (req.method === 'POST') {
    const authenticated = isUserAuthenticated(req);
    if (!authenticated) {
      return res.status(401).json({ error: 'Нет доступа' });
    }

    try {
      const form = formidable({ multiples: false });

      const {
        icon,
        name,
      }: {
        icon: formidable.File | null;
        name: string | null;
      } = await new Promise((resolve, reject) => {
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

      if (!name) {
        return res
          .status(400)
          .json({ error: 'Название отделения обязательно' });
      }

      let photo_url: string | null = null;

      if (icon) {
        const imageData = await cloudinary.uploader.upload(icon.filepath, {
          folder: 'doctoronduty/avatars',
          resource_type: 'image',
          public_id: icon.newFilename,
        });
        photo_url = imageData.secure_url;
      }

      const { data: department, error } = await supabase
        .from('departments')
        .insert({
          name,
          photo_url,
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({ department });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }
}
