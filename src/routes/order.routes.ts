import { Router } from 'express';
import { createOrder, uploadProof, confirmOrder, getOrder, listOrders } from '../controllers/order.controller.ts';
import { authenticate } from '../middleware/authenticate.ts';

const router = Router();

router.post('/', authenticate, createOrder);
router.get('/', authenticate, listOrders);
router.get('/:id', authenticate, getOrder);
router.post('/:id/proof', authenticate, uploadProof);
router.post('/:id/confirm', authenticate, confirmOrder);

export default router;
