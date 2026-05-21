import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import profileRoutes  from './routes/profile.js';
import requestRoutes  from './routes/requests.js';
import activityRoutes from './routes/activity.js';
import tagRoutes      from './routes/tags.js';
import aiRoutes       from './routes/ai.js';

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ── Routes ────────────────────────────────
app.use('/api/profile',               profileRoutes);
app.use('/api/requests',              requestRoutes);
app.use('/api/requests/:requestId',   activityRoutes);
app.use('/api/tags',                  tagRoutes);
app.use('/api/ai',                    aiRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// ── Start ─────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running → http://localhost:${PORT}`));
