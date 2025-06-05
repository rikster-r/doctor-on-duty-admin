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
      const query = supabase
        .from('users')
        .select(
          '*, doctor_data:doctors(specialization, department:departments(id, name))'
        )
        .order('first_name', { ascending: true })
        .neq('id', user.id);

      if (search) {
        const searchTerms = (search as string)
          .toLowerCase()
          .split(' ')
          .filter((term) => term.trim() !== '')
          .map((term) => `%${term}%`);

        query.or(
          searchTerms
            .map((term) =>
              ['doctor_data.specialization', 'first_name', 'last_name']
                .map((field) => `${field}.ilike.${term}`)
                .join(',')
            )
            .join(',')
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
