import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const log = (...args) => console.log("[migrate]", ...args);
const error = (...args) => console.error("[migrate]", ...args);

const getDbConfig = () => ({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cityvetcare_db",
});

const readMigrations = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));
};

const isComplexSql = (sql) => {
  const s = sql.toUpperCase();
  return (
    s.includes("DELIMITER ") ||
    s.includes("CREATE PROCEDURE") ||
    s.includes("CREATE FUNCTION") ||
    s.includes("TRIGGER ")
  );
};

const run = async () => {
  try {
    const db = getDbConfig();
    const connection = await mysql.createConnection({
      ...db,
      multipleStatements: true,
    });

    log("Connected to DB", `${db.host}:${db.port}/${db.database}`);

    // Prefer central Database/migrations dir
    const centralDir = path.resolve(
      __dirname,
      "..",
      "..",
      "Database",
      "migrations"
    );
    // Also allow Backend-Node/migrations/sql for future use
    const localDir = path.resolve(__dirname);

    const candidates = [centralDir, localDir]
      .flatMap((d) => readMigrations(d).map((f) => ({ dir: d, file: f })))
      // De-duplicate identical filenames, prefer centralDir
      .reduce((acc, cur) => {
        if (!acc.find((e) => e.file === cur.file)) acc.push(cur);
        return acc;
      }, []);

    if (candidates.length === 0) {
      log("No .sql migration files found.");
      await connection.end();
      return;
    }

    // Optional: allow filtering by env var to run only specific files
    const only = (process.env.MIGRATIONS_ONLY || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    let applied = 0;
    for (const { dir, file } of candidates) {
      if (only.length && !only.some((frag) => file.includes(frag))) {
        continue;
      }

      const full = path.join(dir, file);
      const sql = fs.readFileSync(full, "utf8");

      if (isComplexSql(sql)) {
        log(
          `Skipping complex migration (run manually in MySQL Workbench): ${file}`
        );
        continue;
      }

      if (!sql.trim()) {
        log(`Skipping empty migration: ${file}`);
        continue;
      }

      log(`Applying: ${file}`);
      try {
        await connection.query(sql);
        applied += 1;
        log(`Applied: ${file}`);
      } catch (e) {
        error(`Failed: ${file}`);
        error(e?.message || e);
        await connection.end();
        process.exitCode = 1;
        return;
      }
    }

    log(`Done. Applied ${applied} migration(s).`);
    await connection.end();
  } catch (e) {
    error("Migration failed:", e?.message || e);
    process.exitCode = 1;
  }
};

run();
