import express, { Application } from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import apiRoutes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

const app: Application = express();

// Middleware
app.use(
  cors({
    origin: ENV.CORS_ORIGIN === '*' ? true : ENV.CORS_ORIGIN.split(','),
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Sheba Event Management & Verified Attendance API',
    version: '1.0.0',
    status: 'ACTIVE',
    documentation: '/api/health',
  });
});

// API Routes
app.use('/api', apiRoutes);

// 404 Catch-All
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;

