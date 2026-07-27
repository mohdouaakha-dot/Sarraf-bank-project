import type { Request, Response } from 'express';
import prisma from '../prisma.ts';

export const testDeposit = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { currency, amountCents } = req.body;
    if (!currency || !amountCents) return res.status(400).json({ error: 'Missing required fields' });

    const wallet = await prisma.wallet.upsert({
      where: { userId_currency: { userId, currency } },
      update: { balanceCents: { increment: amountCents } },
      create: { userId, currency, balanceCents: amountCents, lockedCents: 0 },
    });

    return res.status(200).json({ success: true, wallet });
  } catch (error) {
    console.error('Error depositing funds:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getWallets = async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (userId !== req.user!.id) return res.status(403).json({ error: 'Not your wallet' });
  const wallets = await prisma.wallet.findMany({ where: { userId } });
  return res.status(200).json({ success: true, wallets });
};
