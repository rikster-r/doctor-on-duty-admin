import { NextApiRequest } from 'next';
import jwt from 'jsonwebtoken';

// Gets the token from cookie or Authorization header
export function getAuthTokenFromRequest(req: NextApiRequest): string | null {
  const tokenFromCookie = req.cookies?.authToken;

  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  return tokenFromCookie || tokenFromHeader || null;
}

// Safely extracts and verifies the user from JWT token
export function getUserFromJwt(token: string): User | null {
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as User;
    return user ?? null;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

// Returns true if the JWT is valid
export function isUserAuthenticated(req: NextApiRequest): boolean {
  const token = getAuthTokenFromRequest(req);
  return token ? Boolean(getUserFromJwt(token)) : false;
}

// Shortcut: get user directly from request
export function getUserFromRequest(req: NextApiRequest): User | null {
  const token = getAuthTokenFromRequest(req);
  return token ? getUserFromJwt(token) : null;
}
