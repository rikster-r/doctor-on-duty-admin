import { NextApiRequest, NextApiResponse } from 'next';
import createClient from '@/lib/postgre';
import { getUserFromJwt } from '@/lib/getUserFromJWT';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createClient(req, res);
  const token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ error: 'Нет доступа' });
  }

  if (req.method === 'GET') {
    const user = getUserFromJwt(token);
    if (!user) {
      return res.status(401).json({ error: 'Нет доступа' });
    }

    const { page = '1', size = '10', search = '' } = req.query;
    const pageNum = parseInt(page as string);
    const pageSize = parseInt(size as string);

    if (isNaN(pageNum) || isNaN(pageSize) || pageNum < 1 || pageSize < 1) {
      return res
        .status(400)
        .json({ message: 'Некорректные параметры пагинации' });
    }

    const from = (pageNum - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      let query = supabase
        .from('users')
        .select('*, doctors (specialization, photo_url)', { count: 'exact' })
        .order('id', { ascending: false })
        .neq('id', user.id);

      if (search) {
        const searchTerm = `%${(search as string).toLowerCase()}%`;
        query = query.or(
          `phone_number.ilike.${searchTerm},first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`
        );
      }

      const { data, count, error } = await query.range(from, to);

      if (error) {
        throw new Error(error.message);
      }

      const totalPages = Math.ceil((count || 0) / pageSize);

      return res.status(200).json({
        users: data || [],
        currentPage: pageNum,
        totalPages,
        totalUsers: count || 0,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Server error', error: (error as Error).message });
    }
  }

  return res.status(405).json({ error: 'Метод не разрешен' });
}
