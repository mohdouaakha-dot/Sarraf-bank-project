import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.ts';
import paymentRoutes from './routes/payment.routes.ts';
import offerRoutes from './routes/offer.routes.ts';
import walletRoutes from './routes/wallet.routes.ts';
import orderRoutes from './routes/order.routes.ts';
import kycRoutes from './routes/kyc.routes.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/kyc', kycRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: "Welcome to the Sarraf Marketplace API" });
});

// Added '0.0.0.0' so cloud providers like Render accept incoming traffic
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server is successfully running on port ${PORT}`);
});