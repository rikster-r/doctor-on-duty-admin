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
    const { search = '' } = req.query;

    try {
      let query = supabase
        .from('users')
        .select(
          '*, doctor_data:doctors!inner(specialization, department:departments(id, name))'
        )
        .order('first_name', { ascending: true })
        .neq('id', user.id);

      if (search) {
        const searchTerm = `%${(search as string).toLowerCase()}%`;
        query = query.or(
          `phone_number.ilike.${searchTerm},first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return res.status(200).json(data || []);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Server error', error: (error as Error).message });
    }
  }

  return res.status(405).json({ error: 'Метод не разрешен' });
}
