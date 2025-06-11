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
      // Fetch all users and related doctor data
      const { data, error } = await supabase
        .from('users')
        .select(
          '*, doctor_data:doctors(specialization, department:departments(id, name))'
        )
        .neq('id', user.id)
        .order('first_name', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      // Filter in JavaScript
      const searchTerms = (search as string)
        .toLowerCase()
        .split(' ')
        .filter((term) => term.trim() !== '');

      const filtered = data?.filter((user) =>
        searchTerms.every((term) =>
          [user.first_name, user.last_name, user.doctor_data?.specialization]
            .filter(Boolean)
            .some((field) =>
              (field as string).toLowerCase().includes(term)
            )
        )
      );

      return res.status(200).json(filtered || []);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Server error', error: (error as Error).message });
    }
  }

  return res.status(405).json({ error: 'Метод не разрешен' });
}
