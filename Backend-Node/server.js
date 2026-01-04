import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './config/database.js';
import Logger from './utils/logger.js';
import validateEnv from './utils/validateEnv.js';

// Import routes
import authRouter from './routes/auth.js';
import incidentsRouter from './routes/incidents.js';
import patrolStaffRouter from './routes/patrol-staff.js';
import patrolSchedulesRouter from './routes/patrol-schedules.js';
import catchersRouter from './routes/catchers.js';
import dashboardRouter from './routes/dashboard.js';
import healthRouter from './routes/health.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Validate environment variables
try {
  validateEnv();
} catch (error) {
  console.error('Environment validation failed:', error.message);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const logger = new Logger('SERVER');

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.get('/', (req, res) => {
  res.json({
    message: 'CityVetCare API',
    version: '2.0.0',
    platform: 'Node.js/Express',
    endpoints: {
      '/api/health': 'Health check',
      '/api/auth': 'Authentication (login, register)',
      '/api/incidents': 'Incident management',
      '/api/catchers': 'Catcher team management',
      '/api/patrol-staff': 'Patrol staff management',
      '/api/patrol-schedules': 'Patrol schedule management',
      '/api/dashboard': 'Dashboard statistics'
    },
    documentation: 'See /migrations/MIGRATION_LOG.md for database updates'
  });
});

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/catchers', catchersRouter);
app.use('/api/patrol-staff', patrolStaffRouter);
app.use('/api/patrol-schedules', patrolSchedulesRouter);
app.use('/api/dashboard', dashboardRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Server error', err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Start listening
    app.listen(PORT, () => {
      logger.info('=================================');
      logger.info('🚀 CityVetCare API Server');
      logger.info('=================================');
      logger.info(`📡 Server running on port ${PORT}`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API URL: http://localhost:${PORT}`);
      logger.info(`📚 Docs: http://localhost:${PORT}/`);
      logger.info('=================================');
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();

export default app;
