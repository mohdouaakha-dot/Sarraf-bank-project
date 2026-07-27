import type { Request, Response } from 'express';
import prisma from '../prisma.ts';
import { settleEscrow } from '../services/wallet.service.ts';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const buyerId = req.user!.id;
    const { offerId } = req.body;
    if (!offerId) return res.status(400).json({ error: 'Missing offerId' });

    const offer = await prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer || !offer.isActive) return res.status(400).json({ error: 'Offer is not available' });
    if (offer.userId === buyerId) return res.status(400).json({ error: 'You cannot accept your own offer' });

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          offerId: offer.id,
          buyerId,
          sellerId: offer.userId,
          amountCents: offer.amountCents,
          fiatAmount: Math.round((offer.amountCents / 100) * (offer.rate / 100) * 100),
          status: 'MATCHED',
        },
      });
      await tx.offer.update({ where: { id: offer.id }, data: { isActive: false } });
      return created;
    });

    return res.status(201).json({ success: true, order });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadProof = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { receiptStorageKey } = req.body;
    if (!receiptStorageKey) return res.status(400).json({ error: 'Missing receiptStorageKey' });

    const order = await prisma.order.findUnique({ where: { id: id as string } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.buyerId !== req.user!.id) return res.status(403).json({ error: 'Only the buyer can upload proof for this order' });
    if (!['MATCHED', 'WAITING_FOR_DZD', 'LISTED'].includes(order.status)) {
      return res.status(400).json({ error: `Cannot upload proof from status ${order.status}` });
    }

    const updated = await prisma.order.update({
      where: { id: id as string },
      data: { receiptStorageKey, status: 'PROOF_UPLOADED' },
    });

    return res.status(200).json({ success: true, order: updated });
  } catch (error) {
    console.error('Error uploading proof:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const confirmOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const sellerId = req.user!.id;

    const order = await prisma.order.findUnique({ where: { id: id as string } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.sellerId !== sellerId) return res.status(403).json({ error: 'Only the seller can confirm this order' });
    if (order.status !== 'PROOF_UPLOADED') return res.status(400).json({ error: `Cannot confirm from status ${order.status}` });

    const offer = await prisma.offer.findUniqueOrThrow({ where: { id: order.offerId } });
    await settleEscrow(order.sellerId, order.buyerId, offer.fromCurrency, order.amountCents);

    const updated = await prisma.order.update({ where: { id: id as string }, data: { status: 'COMPLETED' } });
    return res.status(200).json({ success: true, order: updated });
  } catch (error: any) {
    if (error.message === 'LOCKED_BALANCE_MISMATCH') {
      return res.status(500).json({ error: 'Wallet ledger inconsistency, needs manual review' });
    }
    console.error('Error confirming order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await prisma.order.findUnique({ where: { id: id as string } });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.buyerId !== req.user!.id && order.sellerId !== req.user!.id) {
    return res.status(403).json({ error: 'Not your order' });
  }
  return res.status(200).json({ success: true, order });
};

export const listOrders = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const orders = await prisma.order.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    orderBy: { createdAt: 'desc' },
  });
  return res.status(200).json({ success: true, orders });
};
