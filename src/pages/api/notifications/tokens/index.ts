import { NextApiRequest, NextApiResponse } from 'next';
import { Expo } from 'expo-server-sdk';
import createClient from '@/lib/postgre';
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createClient(req, res);
  const user = getUserFromRequest(req);
  
  if (!user) {
    return res.status(401).json({ error: 'Нет доступа' });
  }
  
  if (req.method === 'POST') {
    try {
      const { user_id, push_token, device_type, device_name } = req.body;
      
      // Validate required fields
      if (!user_id || !push_token || !device_type || !device_name) {
        return res.status(400).json({
          error: 'Отсутствуют обязательные поля: user_id, push_token, device_type или device_name',
        });
      }
      
      // Validate the push token format
      if (!Expo.isExpoPushToken(push_token)) {
        return res.status(400).json({
          error: 'Неверный формат push токена',
        });
      }
      
      // Save token to database
      const { error } = await supabase.from('notification_push_tokens').insert([
        {
          user_id,
          token: push_token,
          device_type,
          device_name,
          is_active: true,
        },
      ]);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return res.status(200).json({
        error: null,
      });
    } catch (error) {
      console.error('Ошибка при регистрации push токена:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Ошибка сервера',
      });
    }
  }
  
  return res.status(405).json({ error: 'Метод не разрешен' });
}