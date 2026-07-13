import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password, phoneNumber } = req.body;

    if (!email || !password || !phoneNumber) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phoneNumber }] }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or Phone Number already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          phoneNumber,
          wallets: {
            create: [
              { currency: 'DZD', balanceCents: 0, lockedCents: 0 },
              { currency: 'EUR', balanceCents: 0, lockedCents: 0 }
            ]
          }
        },
        include: { wallets: true }
      });
      return user;
    });

    return res.status(201).json({ message: 'User registered successfully with DZD/EUR wallets.', userId: newUser.id });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Registration failed.' });
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, email: user.email, role: user.role, isKycVerified: user.isKycVerified }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Login failed.' });
  }
};
