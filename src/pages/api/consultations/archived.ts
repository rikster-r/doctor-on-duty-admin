import { NextApiRequest, NextApiResponse } from 'next';
import createClient from '@/lib/postgre';
import { getUserFromRequest } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createClient(req, res);

  if (req.method === 'GET') {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Нет доступа' });
    }

    try {
      const query = supabase
        .from('consultations')
        .select(
          `*, 
          requester:users!requester_id (
        id, first_name, middle_name, last_name, photo_url,
        doctor_data:doctors(specialization, department:departments(id, name))
          ),
          recipient:users!recipient_id (
        id, first_name, middle_name, last_name, photo_url, 
        doctor_data:doctors(specialization, department:departments(id, name))
          )`,
          { count: 'exact' }
        )
        .eq('archived', true)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

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
    const { cron } = req.query;

    if (!cron) {
      return res.status(403).json('Разрешен только крон');
    }

    try {
      const { data, error: updateError } = await supabase
        .from('consultations')
        .update({
          archived: true,
          archived_at: new Date().toISOString(),
        })
        .neq('archived', true)
        .select();

      if (updateError) {
        throw new Error(updateError.message);
      }

      const count = data?.length ?? 0;

      return res.status(200).json({
        message: `Successfully archived ${count} consultations`,
      });
    } catch (error) {
      console.error('Cron job error:', error);
      return res.status(500).json({
        message: 'Cron job failed',
        error: (error as Error).message,
      });
    }
  }

  return res.status(405).json({ error: 'Метод не разрешен' });
}
