import type { Request, Response } from 'express';
import prisma from '../prisma.ts';
import { settleEscrow } from '../services/wallet.service.ts';

// POST /api/orders
// A buyer accepts an active offer. This creates the order and deactivates
// the offer so it can't be matched twice.
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { offerId, buyerId } = req.body;
    if (!offerId || !buyerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const offer = await prisma.offer.findUnique({ where: { id: offerId } });
    if (!offer || !offer.isActive) {
      return res.status(400).json({ error: 'Offer is not available' });
    }
    if (offer.userId === buyerId) {
      return res.status(400).json({ error: 'You cannot accept your own offer' });
    }

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

// POST /api/orders/:id/proof
// Buyer uploads payment proof after sending DZD. receiptStorageKey should be
// a reference to encrypted object storage, not the image itself — never
// accept raw file bytes into this field directly.
export const uploadProof = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { receiptStorageKey } = req.body;
    if (!receiptStorageKey) {
      return res.status(400).json({ error: 'Missing receiptStorageKey' });
    }

    const order = await prisma.order.findUnique({ where: { id: id as string } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'MATCHED' && order.status !== 'WAITING_FOR_DZD') {
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

// POST /api/orders/:id/confirm
// Seller confirms the DZD arrived. This is the ONLY place EUR actually
// changes hands — settleEscrow moves it from the seller's locked balance
// to the buyer's available balance, inside a transaction.
export const confirmOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { sellerId } = req.body;

    const order = await prisma.order.findUnique({ where: { id: id as string } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.sellerId !== sellerId) {
      return res.status(403).json({ error: 'Only the seller can confirm this order' });
    }
    if (order.status !== 'PROOF_UPLOADED') {
      return res.status(400).json({ error: `Cannot confirm from status ${order.status}` });
    }

    const offer = await prisma.offer.findUniqueOrThrow({ where: { id: order.offerId } });

    await settleEscrow(order.sellerId, order.buyerId, offer.fromCurrency, order.amountCents);

    const updated = await prisma.order.update({
      where: { id: id as string },
      data: { status: 'COMPLETED' },
    });

    return res.status(200).json({ success: true, order: updated });
  } catch (error: any) {
    if (error.message === 'LOCKED_BALANCE_MISMATCH') {
      return res.status(500).json({ error: 'Wallet ledger inconsistency — escrow not released, needs manual review' });
    }
    console.error('Error confirming order:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/orders/:id
export const getOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await prisma.order.findUnique({ where: { id: id as string } });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  return res.status(200).json({ success: true, order });
};

// GET /api/orders?userId=...
export const listOrders = async (req: Request, res: Response) => {
  const { userId } = req.query;
  const orders = await prisma.order.findMany({
    where: { OR: [{ buyerId: userId as string }, { sellerId: userId as string }] },
    orderBy: { createdAt: 'desc' },
  });
  return res.status(200).json({ success: true, orders });
};
