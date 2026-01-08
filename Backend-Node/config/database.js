import mysql from "mysql2/promise";
import dotenv from "dotenv";
import Logger from "../utils/logger.js";

dotenv.config();

const logger = new Logger("DATABASE");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cityvetcare_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    logger.success("Database connected successfully");
    connection.release();
  } catch (error) {
    logger.error("Database connection failed", error);
    throw error;
  }
};

export { pool, testConnection };
export default pool;
