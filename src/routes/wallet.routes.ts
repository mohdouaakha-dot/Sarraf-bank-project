import { Router } from 'express';
import { testDeposit, getWallets } from '../controllers/wallet.controller.ts';

const router = Router();

router.post('/test-deposit', testDeposit);
router.get('/:userId', getWallets);

export default router;
