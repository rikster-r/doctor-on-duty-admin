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

  if (req.method === 'PUT') {
    try {
      const { consultationId } = req.query;
      const { action } = req.body;

      let updateFields = {};

      if (action === 'start') {
        updateFields = {
          status: 'in_progress',
          started_at: new Date().toISOString(),
        };
      } else if (action === 'complete') {
        // First, get the current consultation to check started_at
        const { data: currentConsultation, error: fetchError } = await supabase
          .from('consultations')
          .select('started_at')
          .eq('id', consultationId)
          .single();

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        const currentDate = new Date().toISOString();

        updateFields = {
          status: 'completed',
          started_at: currentConsultation.started_at ?? currentDate,
          completed_at: currentDate,
        };
      } else {
        return res
          .status(400)
          .json({ error: 'Разрешены только статусы "start" или "complete"' });
      }

      const { error } = await supabase
        .from('consultations')
        .update(updateFields)
        .eq('id', consultationId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      res.status(200).json({ error: null });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Ошибка сервера', error: (error as Error).message });
    }
  }

  return res.status(405).json({ error: 'Метод не разрешен' });
}
