import { Router } from 'express';
import { getStats, getPendingKyc, reviewKyc } from '../controllers/admin.controller.ts';
import { authenticate } from '../middleware/authenticate.ts';
import { requireAdmin } from '../middleware/requireAdmin.ts';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', getStats);
router.get('/kyc/pending', getPendingKyc);
router.post('/kyc/:userId/review', reviewKyc);

export default router;
