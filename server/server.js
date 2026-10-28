import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import { AUTH_TOKEN_SECRET, CLIENT_ORIGINS, PORT, requireAuthTokenSecret } from './config/serverConfig.js';
import orderRoutes from './routes/orderRoutes.js';
import payoutRoutes from './routes/payoutRoutes.js';
import productRoutes from './routes/productRoutes.js';

const app = express();

requireAuthTokenSecret();
if (!AUTH_TOKEN_SECRET) {
  throw new Error('Authentication secret is not configured.');
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || CLIENT_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS origin is not allowed.'));
    },
  }),
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MarketHub backend is running',
  });
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/auth', authRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
  });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'Request body contains invalid JSON.',
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    message: 'Internal server error.',
  });
});

app.listen(PORT, () => {
  console.log(`MarketHub backend listening on http://localhost:${PORT}`);
});
