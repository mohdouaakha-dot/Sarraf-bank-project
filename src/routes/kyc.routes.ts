import { Router } from 'express';
import { submitKyc, getKycStatus } from '../controllers/kyc.controller.ts';
import { authenticate } from '../middleware/authenticate.ts';

const router = Router();

router.post('/submit', authenticate, submitKyc);
router.get('/:userId', authenticate, getKycStatus);

export default router;
