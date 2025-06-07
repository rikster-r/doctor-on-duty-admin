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

      let updateFields: Record<string, string> = {};
      const now = new Date().toISOString();

      switch (action) {
        case 'start_by_recipient':
          updateFields = {
            status: 'awaiting_requester_start_confirmation',
            started_at: now,
          };
          break;

        case 'confirm_start':
          updateFields = {
            status: 'in_progress',
            requester_start_confirmed_at: now,
          };
          break;

        case 'finish_by_recipient':
          updateFields = {
            status: 'awaiting_requester_finish_confirmation',
            recipient_finished_at: now,
          };
          break;

        case 'confirm_finish':
          updateFields = {
            status: 'completed',
            requester_finish_confirmed_at: now,
            completed_at: now,
          };
          break;

        default:
          return res.status(400).json({
            error:
              'Разрешены только действия: start_by_recipient, confirm_start, finish_by_recipient, confirm_finish',
          });
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

      return res.status(200).json({ error: null });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: 'Ошибка сервера',
        error: (error as Error).message,
      });
    }
  }

  return res.status(405).json({ error: 'Метод не разрешен' });
}
