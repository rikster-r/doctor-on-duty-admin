import { NextApiRequest, NextApiResponse } from 'next';
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

  if (req.method === 'GET') {
    const { from, to } = req.query;

    try {
      const query = supabase
        .from('consultations')
        .select(
          `*, 
          requester:users!requester_id (
            id, first_name, last_name, photo_url,
            doctor_data:doctors(specialization, department:departments(id, name))
          ),
          recipient:users!recipient_id (
            id, first_name, last_name, photo_url, 
            doctor_data:doctors(specialization, department:departments(id, name))
          )`,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false });

      if (from) {
        query.eq('requester_id', from);
      }

      if (to) {
        query.eq('recipient_id', to);
      }

      const { data, count, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return res.status(200).json({
        consultations: data || [],
        totalConsultations: count || 0,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Server error', error: (error as Error).message });
    }
  } else if (req.method === 'POST') {
    const {
      recipient_id,
      requester_id,
      consultation_type, // первичная или повторная
      consultation_mode, // по телефону или очно
      reason,
      urgency,
    } = req.body;

    if (
      !recipient_id ||
      !requester_id ||
      !consultation_type ||
      !consultation_mode ||
      !reason ||
      !urgency
    ) {
      return res.status(400).json({ error: 'Заполните все поля' });
    }

    try {
      const { error } = await supabase.from('consultations').insert([
        {
          recipient_id,
          requester_id,
          consultation_type,
          consultation_mode,
          reason,
          urgency,
          status: 'pending',
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      return res.status(200).json({
        error: null,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Server error', error: (error as Error).message });
    }
  }

  return res.status(405).json({ error: 'Метод не разрешен' });
}
