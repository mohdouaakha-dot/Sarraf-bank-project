import type { Request, Response } from 'express';
import prisma from '../prisma.ts';
import { encrypt, maskAccount } from '../cryptoUtils.ts';

export const addPaymentAccount = async (req: Request, res: Response) => {
  try {
    const { userId, type, currency, accountNumber } = req.body;

    if (!userId || !type || !currency || !accountNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const encryptedValue = encrypt(accountNumber);
    const maskedDisplay = maskAccount(accountNumber, type);

    const newAccount = await prisma.paymentAccount.create({
      data: {
        userId,
        type,
        currency,
        encryptedValue,
        maskedDisplay,
        isVerified: false
      }
    });

    return res.status(201).json({
      message: 'Payment account added successfully',
      account: {
        id: newAccount.id,
        type: newAccount.type,
        currency: newAccount.currency,
        maskedDisplay: newAccount.maskedDisplay
      }
    });
  } catch (error: any) {
    console.error('Error adding payment account:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPaymentAccounts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    const accounts = await prisma.paymentAccount.findMany({
      where: { userId: userId as string }
    });

    const safeAccounts = accounts.map(account => ({
      id: account.id,
      type: account.type,
      currency: account.currency,
      maskedDisplay: account.maskedDisplay,
      isVerified: account.isVerified,
      createdAt: account.createdAt
    }));

    return res.status(200).json({ success: true, accounts: safeAccounts });
  } catch (error) {
    console.error('Error fetching payment accounts:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
