import type { Request, Response } from 'express';
import prisma from '../prisma.ts';

export const submitKyc = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { idDocumentStorageKey, selfieStorageKey } = req.body;
    if (!idDocumentStorageKey || !selfieStorageKey) return res.status(400).json({ error: 'Missing required fields' });

    const kyc = await prisma.$transaction(async (tx) => {
      const record = await tx.kycVerification.upsert({
        where: { userId },
        update: { idDocumentStorageKey, selfieStorageKey, status: 'PENDING' },
        create: { userId, idDocumentStorageKey, selfieStorageKey, status: 'PENDING' },
      });
      await tx.user.update({ where: { id: userId }, data: { kycStatus: 'PENDING' } });
      return record;
    });

    return res.status(201).json({ success: true, kyc: { status: kyc.status, submittedAt: kyc.createdAt } });
  } catch (error) {
    console.error('Error submitting KYC:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getKycStatus = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (userId !== req.user!.id) return res.status(403).json({ error: 'Not your KYC record' });
  const kyc = await prisma.kycVerification.findUnique({ where: { userId } });
  return res.status(200).json({ success: true, kyc: kyc ? { status: kyc.status, reviewedAt: kyc.reviewedAt } : { status: 'NOT_STARTED' } });
};
