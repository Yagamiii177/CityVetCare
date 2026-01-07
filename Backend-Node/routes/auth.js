import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";
import Logger from "../utils/logger.js";
import Admin from "../models/Admin.js";
import PetOwner from "../models/PetOwner.js";

const router = express.Router();
const logger = new Logger("AUTH_ROUTES");

/**
 * Generate JWT token
 */
const generateToken = (user, userType) => {
  const payload = {
    id: userType === "admin" ? user.admin_id : user.owner_id,
    userType: userType,
    fullName: user.full_name || user.full_name,
  };

  if (userType === "admin") {
    payload.username = user.username;
    payload.role = user.role;
  } else if (userType === "pet_owner") {
    payload.email = user.email;
    payload.contactNumber = user.contact_number;
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  });
};

/**
 * POST /api/auth/login
 * Login for both admin and pet owner
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password, userType } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        error: true,
        message: "Username and password are required",
      });
    }

    if (!userType || !["admin", "pet_owner"].includes(userType)) {
      return res.status(400).json({
        error: true,
        message: "User type must be specified (admin or pet_owner)",
      });
    }

    let user = null;
    let token = null;

    // Admin login
    if (userType === "admin") {
      user = await Admin.findByUsername(username);

      if (!user) {
        return res.status(401).json({
          error: true,
          message: "Invalid username or password",
        });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({
          error: true,
          message: "Invalid username or password",
        });
      }

      token = generateToken(user, "admin");
      logger.info(`Admin logged in: ${username}`);

      return res.json({
        success: true,
        message: "Login successful",
        token,
        userId: user.admin_id,
        userType: "admin",
        role: user.role,
        username: user.username,
        fullName: user.full_name,
      });
    }

    // Pet Owner login (use email as username)
    if (userType === "pet_owner") {
      user = await PetOwner.findByEmail(username);

      if (!user) {
        return res.status(401).json({
          error: true,
          message: "Invalid email or password",
        });
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({
          error: true,
          message: "Invalid email or password",
        });
      }

      token = generateToken(user, "pet_owner");
      logger.info(`Pet owner logged in: ${username}`);

      return res.json({
        success: true,
        message: "Login successful",
        token,
        userId: user.owner_id,
        userType: "pet_owner",
        email: user.email,
        fullName: user.full_name,
        contactNumber: user.contact_number,
      });
    }
  } catch (error) {
    logger.error("Login error", error);
    res.status(500).json({
      error: true,
      message: "Login failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * POST /api/auth/create-admin
 * Create new admin account
 */
router.post("/create-admin", async (req, res) => {
  try {
    const { fullName, username, password, role } = req.body;

    // Validation
    if (!fullName || !username || !password || !role) {
      return res.status(400).json({
        error: true,
        message: "Full name, username, password, and role are required",
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        error: true,
        message: "Password must be at least 4 characters long",
      });
    }

    if (!["veterinarian", "staff"].includes(role)) {
      return res.status(400).json({
        error: true,
        message: "Role must be either veterinarian or staff",
      });
    }

    // Check if username already exists
    const existing = await Admin.findByUsername(username);
    if (existing) {
      return res.status(409).json({
        error: true,
        message: "Username already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const result = await Admin.create(fullName, username, hashedPassword, role);

    logger.info(`Admin created: ${username} (${role})`);

    res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      adminId: result.insertId,
    });
  } catch (error) {
    logger.error("Create admin error", error);
    res.status(500).json({
      error: true,
      message: "Failed to create admin account",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * POST /api/auth/register
 * Register new pet owner account
 */
router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      contactNumber,
      address,
    } = req.body;

    // Validation
    if (!fullName || !email || !password || !contactNumber || !address) {
      return res.status(400).json({
        error: true,
        message:
          "Full name, email, password, contact number, and address are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: true,
        message: "Passwords do not match",
      });
    }

    if (password.length < 4) {
      return res.status(400).json({
        error: true,
        message: "Password must be at least 4 characters long",
      });
    }

    // Check if email already exists
    const existing = await PetOwner.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        error: true,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create pet owner
    const result = await PetOwner.create(
      fullName,
      email,
      hashedPassword,
      contactNumber,
      address
    );

    logger.info(`Pet owner registered: ${email}`);

    res.status(201).json({
      success: true,
      message: "Account created successfully. You can now login.",
      ownerId: result.insertId,
    });
  } catch (error) {
    logger.error("Register error", error);
    res.status(500).json({
      error: true,
      message: "Failed to create account",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;
