import { verifyToken } from '@clerk/backend';
import 'dotenv/config';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing token' });
    }
    const token = authHeader.slice(7);
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      authorizedParties: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
      ],
    });
    req.clerkId = payload.sub;
    next();
  } catch (err) {
    console.error('Auth error:', err.message || err);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
