import type { Request, Response } from 'express';
import prisma from '../prisma.ts';

export const getStats = async (_req: Request, res: Response) => {
  const [totalUsers, activeOffers, pendingKyc, totalOrders] = await Promise.all([
    prisma.user.count(),
    prisma.offer.count({ where: { isActive: true } }),
    prisma.kycVerification.count({ where: { status: 'PENDING' } }),
    prisma.order.count(),
  ]);
  return res.status(200).json({ totalUsers, activeOffers, pendingKyc, totalOrders });
};

export const getPendingKyc = async (_req: Request, res: Response) => {
  const records = await prisma.kycVerification.findMany({
    where: { status: 'PENDING' },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return res.status(200).json({ pendingKyc: records });
};

export const reviewKyc = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { status } = req.body; // 'VERIFIED' or 'REJECTED'
  if (!['VERIFIED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'status must be VERIFIED or REJECTED' });
  }

  await prisma.$transaction(async (tx) => {
    await tx.kycVerification.update({ where: { userId }, data: { status, reviewedAt: new Date() } });
    await tx.user.update({ where: { id: userId }, data: { kycStatus: status } });
  });

  return res.status(200).json({ success: true });
};
