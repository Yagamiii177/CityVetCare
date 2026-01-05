import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import Logger from '../utils/logger.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const logger = new Logger('AUTH_ROUTES');

/**
 * Generate JWT tokens
 */
const generateTokens = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    full_name: user.full_name
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // 7 days for mobile app convenience
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
};

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { 
      username, 
      password, 
      email, 
      full_name, 
      contact_number,
      address 
    } = req.body;

    // Validation
    if (!username || !password || !email || !full_name || !contact_number) {
      return res.status(400).json({
        error: true,
        message: 'All fields are required (username, password, email, full_name, contact_number)'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: true,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if username or email already exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: true,
        message: 'Username or email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user (default role is 'user')
    const [result] = await connection.execute(
      `INSERT INTO users (username, password, email, full_name, contact_number, address, role, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'user', 'active')`,
      [username, hashedPassword, email, full_name, contact_number, address || null]
    );

    // Get the created user
    const [users] = await connection.execute(
      'SELECT id, username, email, full_name, contact_number, address, role, status, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    const user = users[0];
    
    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    logger.info(`User registered: ${username}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        contact_number: user.contact_number,
        address: user.address,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    logger.error('Registration error', error);
    res.status(500).json({
      error: true,
      message: 'Registration failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        error: true,
        message: 'Username and password are required'
      });
    }

    // Get user by username
    const [users] = await connection.execute(
      'SELECT id, username, password, email, full_name, contact_number, address, role, status FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: true,
        message: 'Invalid username or password'
      });
    }

    const user = users[0];

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(403).json({
        error: true,
        message: 'Account is not active'
      });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        error: true,
        message: 'Invalid username or password'
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    logger.info(`User logged in: ${username}`);

    res.json({
      success: true,
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        contact_number: user.contact_number,
        address: user.address,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    logger.error('Login error', error);
    res.status(500).json({
      error: true,
      message: 'Login failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: true,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          error: true,
          message: 'Invalid refresh token'
        });
      }

      // Get user
      const connection = await pool.getConnection();
      try {
        const [users] = await connection.execute(
          'SELECT id, username, email, full_name, role FROM users WHERE id = ? AND status = ?',
          [decoded.id, 'active']
        );

        if (users.length === 0) {
          return res.status(404).json({
            error: true,
            message: 'User not found'
          });
        }

        const user = users[0];
        const tokens = generateTokens(user);

        res.json({
          success: true,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        });
      } finally {
        connection.release();
      }
    });

  } catch (error) {
    logger.error('Token refresh error', error);
    res.status(500).json({
      error: true,
      message: 'Token refresh failed'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [users] = await connection.execute(
      'SELECT id, username, email, full_name, contact_number, address, role, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    logger.error('Get user error', error);
    res.status(500).json({
      error: true,
      message: 'Failed to get user info'
    });
  } finally {
    connection.release();
  }
});

/**
 * POST /api/auth/logout
 * Logout (client should delete tokens)
 */
router.post('/logout', authenticateToken, (req, res) => {
  logger.info(`User logged out: ${req.user.username}`);
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * PUT /api/auth/change-password
 * Change user password
 */
router.put('/change-password', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: true,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: true,
        message: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const [users] = await connection.execute(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, users[0].password);
    if (!validPassword) {
      return res.status(401).json({
        error: true,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await connection.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    logger.info(`Password changed for user: ${req.user.username}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    logger.error('Change password error', error);
    res.status(500).json({
      error: true,
      message: 'Failed to change password'
    });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const [users] = await connection.execute(
      'SELECT id, username, email, full_name, contact_number, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    logger.error('Get profile error', error);
    res.status(500).json({
      error: true,
      message: 'Failed to get profile'
    });
  } finally {
    connection.release();
  }
});

export default router;
