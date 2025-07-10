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

  const { departmentId } = req.query;

  if (!departmentId) {
    return res.status(400).json({ error: 'Отсутствует departmentId' });
  }

  if (req.method === 'GET') {
    try {
      // Fetch all users and related doctor data
      const { data, error } = await supabase
        .from('users')
        .select(
          '*, doctor_data:doctors!inner(specialization, department:departments!inner(id, name))'
        )
        .neq('id', user.id)
        .order('first_name', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      const filteredDoctors = data.filter(
        (doctor) => doctor.doctor_data.department.id === Number(departmentId)
      );

      return res.status(200).json(filteredDoctors);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: 'Server error', error: (error as Error).message });
    }
  }

  return res.status(405).json({ error: 'Метод не разрешен' });
}
