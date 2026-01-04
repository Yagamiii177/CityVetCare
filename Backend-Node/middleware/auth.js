import jwt from 'jsonwebtoken';
import Logger from '../utils/logger.js';

const logger = new Logger('AUTH_MIDDLEWARE');

/**
 * Verify JWT token from Authorization header
 */
export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: true,
        message: 'Access token required'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        logger.warn('Token verification failed', err.message);
        return res.status(403).json({
          error: true,
          message: 'Invalid or expired token'
        });
      }

      // Attach user info to request
      req.user = decoded;
      next();
    });
  } catch (error) {
    logger.error('Authentication error', error);
    return res.status(500).json({
      error: true,
      message: 'Authentication failed'
    });
  }
};

/**
 * Optional authentication - allows both authenticated and unauthenticated requests
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (!err) {
          req.user = decoded;
        }
      });
    }
    
    next();
  } catch (error) {
    logger.error('Optional auth error', error);
    next();
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: true,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

export default {
  authenticateToken,
  optionalAuth,
  authorize
};
