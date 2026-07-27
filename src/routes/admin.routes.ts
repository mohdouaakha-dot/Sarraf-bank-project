import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.ts';
import { requireAdmin } from '../middleware/requireAdmin.ts';
import { getDashboardStats, getPendingKycUsers } from '../controllers/admin.controller.ts';

const router = Router();

// Protect all admin endpoints with authenticate + requireAdmin middleware
router.use(authenticate, requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/kyc/pending', getPendingKycUsers);

export default router;
