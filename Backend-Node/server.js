import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';

// Import routes
import incidentsRouter from './routes/incidents.js';
import patrolStaffRouter from './routes/patrol-staff.js';
import patrolSchedulesRouter from './routes/patrol-schedules.js';
import catchersRouter from './routes/catchers.js';
import dashboardRouter from './routes/dashboard.js';
import healthRouter from './routes/health.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
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
  console.error('Error:', err);
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
      console.log('=================================');
      console.log('🚀 CityVetCare API Server');
      console.log('=================================');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`📚 Docs: http://localhost:${PORT}/`);
      console.log('=================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
