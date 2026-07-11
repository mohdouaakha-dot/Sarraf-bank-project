import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Register API Routes
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Sarraf Core Engine with Auth integration is running perfectly.' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Escrow Engine live on http://localhost:${PORT}`);
});