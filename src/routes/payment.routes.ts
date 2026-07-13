import { Router } from 'express';
import { addPaymentAccount, getPaymentAccounts } from '../controllers/payment.controller.ts';

const router = Router();

router.post('/account', addPaymentAccount);
router.get('/user/:userId', getPaymentAccounts);

export default router;
