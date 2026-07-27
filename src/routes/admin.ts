import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';
import { prisma } from '../lib/prisma';

const router = Router();

// Apply authentication and admin verification middleware
router.use(authenticate, requireAdmin);

// Get platform-wide overview statistics
router.get('/stats', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const activeOffers = await prisma.offer.count({ where: { status: 'ACTIVE' } });
    const pendingKyc = await prisma.kyc.count({ where: { status: 'PENDING' } });
    const totalOrders = await prisma.order.count();

    return res.json({
      totalUsers: userCount,
      activeOffers,
      pendingKyc,
      totalOrders
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// List pending KYC requests for admin review
router.get('/kyc/pending', async (req, res) => {
  try {
    const pendingKycList = await prisma.kyc.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } }
    });
    return res.json({ pendingKyc: pendingKycList });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch pending KYC requests' });
  }
});

export default router;
