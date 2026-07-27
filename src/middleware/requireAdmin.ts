import { Request, Response, NextFunction } from 'express';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Assumes authenticate middleware has already attached user to req
  const user = (req as any).user;

  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied: Admin privileges required' });
  }

  next();
}
