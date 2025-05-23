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

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Некорректный айди пользователя' });
  }

  if (req.method === 'PUT') {
    const form = formidable({ multiples: true });

    try {
      // Парсинг
      const {
        profile_image,
      }: {
        profile_image: formidable.File | null;
      } = await new Promise(function (resolve, reject) {
        form.parse(req, (err, fields, files) => {
          if (err) {
            reject(err);
            return;
          }

          resolve({
            profile_image: files.profile_image?.at(0) ?? null,
          });
        });
      });

      // Сохранение картинки
      let imageData;
      if (profile_image) {
        imageData = await cloudinary.uploader.upload(profile_image.filepath, {
          folder: 'doctoronduty/avatars',
          resource_type: 'image',
          public_id: profile_image.newFilename,
        });
      }

      const { data: user, error: updateError } = await supabase
        .from('users')
        .update([
          {
            photo_url: imageData?.secure_url ?? null,
          },
        ])
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.log(updateError);
        return res.status(500).json({ error: updateError.message });
      }

      return res.status(200).json({ user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  }
}
