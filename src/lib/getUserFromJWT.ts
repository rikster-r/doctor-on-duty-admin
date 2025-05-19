import jwt from 'jsonwebtoken';

export function getUserFromJwt(token: string): User | null {
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as User;
    return user ?? null;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}
