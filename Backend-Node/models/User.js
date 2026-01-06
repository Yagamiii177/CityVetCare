import bcrypt from 'bcrypt';
import { query } from '../config/database.js';

class User {
  /**
   * Create a new user
   */
  static async create({ username, email, password, role = 'user' }) {
    try {
      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const result = await query(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [username, email, passwordHash, role]
      );

      return {
        id: result.insertId,
        username,
        email,
        role,
        created_at: new Date()
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('username')) {
          throw new Error('Username already exists');
        } else if (error.message.includes('email')) {
          throw new Error('Email already exists');
        }
      }
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id) {
    const users = await query(
      'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    return users.length > 0 ? users[0] : null;
  }

  /**
   * Find user by username
   */
  static async findByUsername(username) {
    const users = await query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    return users.length > 0 ? users[0] : null;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const users = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    return users.length > 0 ? users[0] : null;
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update user
   */
  static async update(id, updates) {
    const allowedUpdates = ['username', 'email', 'role'];
    const updateFields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);

    await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    return await User.findById(id);
  }

  /**
   * Update password
   */
  static async updatePassword(id, newPassword) {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, id]
    );

    return true;
  }

  /**
   * Delete user
   */
  static async delete(id) {
    await query('DELETE FROM users WHERE id = ?', [id]);
    return true;
  }

  /**
   * Get all users with pagination
   */
  static async getAll({ page = 1, limit = 10, role = null }) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT id, username, email, role, created_at, updated_at FROM users';
    const params = [];

    if (role) {
      sql += ' WHERE role = ?';
      params.push(role);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const users = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM users';
    if (role) {
      countSql += ' WHERE role = ?';
      const [countResult] = await query(countSql, [role]);
      return {
        users,
        pagination: {
          page,
          limit,
          total: countResult.total,
          totalPages: Math.ceil(countResult.total / limit)
        }
      };
    }

    const [countResult] = await query(countSql);
    return {
      users,
      pagination: {
        page,
        limit,
        total: countResult.total,
        totalPages: Math.ceil(countResult.total / limit)
      }
    };
  }
}

export default User;
