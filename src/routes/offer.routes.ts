import { Router } from 'express';
import { createOffer, cancelOffer, listActiveOffers } from '../controllers/offer.controller.ts';
import { authenticate } from '../middleware/authenticate.ts';

const router = Router();

router.get('/', listActiveOffers);
router.post('/', authenticate, createOffer);
router.post('/:id/cancel', authenticate, cancelOffer);

export default router;
