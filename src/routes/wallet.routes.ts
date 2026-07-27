import { Router } from 'express';
import { testDeposit, getWallets } from '../controllers/wallet.controller.ts';
import { authenticate } from '../middleware/authenticate.ts';

const router = Router();

router.post('/test-deposit', authenticate, testDeposit);
router.get('/:userId', authenticate, getWallets);

export default router;
