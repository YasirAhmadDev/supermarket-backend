import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import apiRoutes from './routes/index.js';
import errorHandler from './middlewares/error.middleware.js';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes — mounted at /api/v1, so full paths look like:
// http://localhost:5000/api/v1/auth/register
app.use('/api/v1', apiRoutes);

// Global error handler — must be registered last
app.use(errorHandler);

export default app;