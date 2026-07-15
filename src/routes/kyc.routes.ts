import { Router } from 'express';
import { submitKyc, getKycStatus } from '../controllers/kyc.controller.ts';

const router = Router();

router.post('/submit', submitKyc);
router.get('/:userId', getKycStatus);

export default router;
