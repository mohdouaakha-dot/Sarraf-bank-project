import prisma from '../prisma.ts';

// Locks amountCents from a user's available balance into lockedCents.
// Runs as a single DB transaction so two near-simultaneous requests can't
// both pass the balance check before either writes back.
export async function reserveFunds(userId: string, currency: string, amountCents: number) {
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({
      where: { userId_currency: { userId, currency } },
    });

    if (!wallet || wallet.balanceCents < amountCents) {
      throw new Error('INSUFFICIENT_FUNDS');
    }

    return tx.wallet.update({
      where: { userId_currency: { userId, currency } },
      data: {
        balanceCents: { decrement: amountCents },
        lockedCents: { increment: amountCents },
      },
    });
  });
}

export async function releaseFunds(userId: string, currency: string, amountCents: number) {
  return prisma.$transaction(async (tx) => {
    return tx.wallet.update({
      where: { userId_currency: { userId, currency } },
      data: {
        balanceCents: { increment: amountCents },
        lockedCents: { decrement: amountCents },
      },
    });
  });
}

export async function settleEscrow(sellerId: string, buyerId: string, currency: string, amountCents: number) {
  return prisma.$transaction(async (tx) => {
    const sellerWallet = await tx.wallet.findUnique({
      where: { userId_currency: { userId: sellerId, currency } },
    });
    if (!sellerWallet || sellerWallet.lockedCents < amountCents) {
      throw new Error('LOCKED_BALANCE_MISMATCH');
    }

    await tx.wallet.update({
      where: { userId_currency: { userId: sellerId, currency } },
      data: { lockedCents: { decrement: amountCents } },
    });

    await tx.wallet.upsert({
      where: { userId_currency: { userId: buyerId, currency } },
      update: { balanceCents: { increment: amountCents } },
      create: { userId: buyerId, currency, balanceCents: amountCents, lockedCents: 0 },
    });
  });
}
