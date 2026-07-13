import { Router } from 'express';
import { createOffer, cancelOffer, listActiveOffers } from '../controllers/offer.controller.ts';

const router = Router();

router.get('/', listActiveOffers);
router.post('/', createOffer);
router.post('/:id/cancel', cancelOffer);

export default router;
