import type { Request, Response } from 'express';
import prisma from '../prisma.ts';

// POST /api/kyc/submit
// Stores REFERENCES to the ID document and selfie (filenames or object
// storage keys), never the files themselves in the database. Status starts
// PENDING — no automated verification yet, so this sits waiting for manual
// admin review until a real KYC provider is wired in later.
export const submitKyc = async (req: Request, res: Response) => {
  try {
    const { userId, idDocumentStorageKey, selfieStorageKey } = req.body;
    if (!userId || !idDocumentStorageKey || !selfieStorageKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

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

// GET /api/kyc/:userId
export const getKycStatus = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const kyc = await prisma.kycVerification.findUnique({ where: { userId } });
  return res.status(200).json({ success: true, kyc: kyc ? { status: kyc.status, reviewedAt: kyc.reviewedAt } : { status: 'NOT_STARTED' } });
};
