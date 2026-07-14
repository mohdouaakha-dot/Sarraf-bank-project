import type { Request, Response } from 'express';
import prisma from '../prisma.ts';
import { reserveFunds, releaseFunds } from '../services/wallet.service.ts';

// POST /api/offers
export const createOffer = async (req: Request, res: Response) => {
  try {
    const { userId, side, fromCurrency, toCurrency, rate, amountCents, minAmountCents, maxAmountCents, paymentMethod } = req.body;

    if (!userId || !side || !fromCurrency || !toCurrency || !rate || !amountCents) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (side === 'SELL') {
      await reserveFunds(userId, fromCurrency, amountCents);
    }

    const offer = await prisma.offer.create({
      data: {
        userId, 
        side, 
        fromCurrency, 
        toCurrency, 
        rate: parseFloat(rate), 
        amountCents: parseInt(amountCents), 
        minAmountCents: minAmountCents ? parseInt(minAmountCents) : parseInt(amountCents), 
        maxAmountCents: maxAmountCents ? parseInt(maxAmountCents) : parseInt(amountCents), 
        paymentMethod: paymentMethod || 'CASH', 
      },
    });

    return res.status(201).json({ success: true, offer });
  } catch (error: any) {
    if (error.message === 'INSUFFICIENT_FUNDS') {
      return res.status(400).json({ error: 'Not enough available balance to create this offer' });
    }
    console.error('Error creating offer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/offers/:id/cancel
export const cancelOffer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const offer = await prisma.offer.findUnique({ where: { id: id as string } });

    if (!offer) return res.status(404).json({ error: 'Offer not found' });
    if (!offer.isActive) return res.status(400).json({ error: 'Offer is already inactive' });

    if (offer.side === 'SELL') {
      await releaseFunds(offer.userId, offer.fromCurrency, offer.amountCents);
    }

    await prisma.offer.update({ where: { id: id as string }, data: { isActive: false } });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error cancelling offer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/offers
export const listActiveOffers = async (_req: Request, res: Response) => {
  try {
    const offers = await prisma.offer.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ success: true, offers });
  } catch (error) {
    console.error('Error listing offers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};