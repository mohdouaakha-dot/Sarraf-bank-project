import express from 'express';
import type { Request, Response } from 'express'; // This tells Node these are just types, not running code!
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from your .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());          
app.use(express.json());  

// A basic "Health Check" route to test if the server is alive
app.get('/', (req: Request, res: Response) => {
  res.json({ message: "Welcome to the Sarraf Marketplace API! The server is alive and running." });
});

// Start listening for incoming traffic
app.listen(PORT, () => {
  console.log(`🚀 Server is successfully running on http://localhost:${PORT}`);
});