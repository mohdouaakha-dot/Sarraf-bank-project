import { Router } from 'express';
import { addPaymentAccount, getPaymentAccounts } from '../controllers/payment.controller.ts';
import { authenticate } from '../middleware/authenticate.ts';

const router = Router();

router.post('/account', authenticate, addPaymentAccount);
router.get('/user/:userId', authenticate, getPaymentAccounts);

export default router;
