import type { Request, Response } from 'express';
import prisma from '../prisma.ts';

export const getDashboardStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const totalUsers = await prisma.user.count();
    const activeOffers = await prisma.offer.count({ where: { status: 'ACTIVE' } }).catch(() => 0);
    const pendingKyc = await prisma.user.count({ where: { kycStatus: 'PENDING' } }).catch(() => 0);
    const totalOrders = await prisma.order.count().catch(() => 0);

    return res.json({
      totalUsers,
      activeOffers,
      pendingKyc,
      totalOrders
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch admin stats' });
  }
};

export const getPendingKycUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const pendingKyc = await prisma.user.findMany({
      where: { kycStatus: 'PENDING' },
      select: { id: true, firstName: true, lastName: true, email: true, createdAt: true }
    });

    const mapped = pendingKyc.map(u => ({ userId: u.id, user: u }));
    return res.json({ pendingKyc: mapped });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch KYC records' });
  }
};
