import type { Request, Response } from 'express';
import prisma from '../prisma.ts';

// TEST-ONLY endpoint to simulate a EUR/DZD deposit landing in a wallet.
// In production this gets replaced by a real webhook/confirmation flow —
// never let a client just add money to their own balance on request.
export const testDeposit = async (req: Request, res: Response) => {
  try {
    const { userId, currency, amountCents } = req.body;
    if (!userId || !currency || !amountCents) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

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

// GET /api/wallet/:userId
export const getWallets = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const wallets = await prisma.wallet.findMany({ where: { userId } });
  return res.status(200).json({ success: true, wallets });
};
