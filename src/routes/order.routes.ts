import { Router } from 'express';
import { createOrder, uploadProof, confirmOrder, getOrder, listOrders } from '../controllers/order.controller.ts';

const router = Router();

router.post('/', createOrder);
router.get('/', listOrders);
router.get('/:id', getOrder);
router.post('/:id/proof', uploadProof);
router.post('/:id/confirm', confirmOrder);

export default router;
