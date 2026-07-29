import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth.routes.ts';
import paymentRoutes from './routes/payment.routes.ts';
import offerRoutes from './routes/offer.routes.ts';
import walletRoutes from './routes/wallet.routes.ts';
import orderRoutes from './routes/order.routes.ts';
import kycRoutes from './routes/kyc.routes.ts';
import adminRoutes from './routes/admin.routes.ts';
import adminRoutes from './routes/admin.routes.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const publicPath = path.resolve(process.cwd(), 'public');

app.use(cors());
app.use(express.json());

// Serve static assets
app.use(express.static(publicPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
