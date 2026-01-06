import { pool } from "./config/database.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all tables from database
async function getAllTables() {
  const [tables] = await pool.query("SHOW TABLES");
  return tables.map((row) => Object.values(row)[0]);
}

// Get table structure
async function getTableStructure(tableName) {
  const [columns] = await pool.query(`DESCRIBE ${tableName}`);
  return columns;
}

// Convert SQL type to JS type comment
function sqlTypeToJsType(sqlType) {
  if (sqlType.includes("int")) return "number";
  if (sqlType.includes("varchar") || sqlType.includes("text")) return "string";
  if (sqlType.includes("date") || sqlType.includes("timestamp")) return "Date";
  if (sqlType.includes("decimal") || sqlType.includes("float")) return "number";
  if (sqlType.includes("json")) return "object";
  if (sqlType.includes("enum")) return "string";
  return "any";
}

// Generate model class name from table name
function generateClassName(tableName) {
  // Convert snake_case to PascalCase
  return tableName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

// Generate model file content
function generateModelContent(tableName, columns) {
  const className = generateClassName(tableName);
  const primaryKey = columns.find((col) => col.Key === "PRI")?.Field || "id";

  let content = `import { pool } from '../config/database.js';
import Logger from '../utils/logger.js';

const logger = new Logger('${className.toUpperCase()}_MODEL');

class ${className} {
  /**
   * Find ${className.toLowerCase()} by ${primaryKey}
   * @param {${sqlTypeToJsType(
     columns.find((col) => col.Field === primaryKey)?.Type
   )}} ${primaryKey}
   * @returns {Promise<object|null>}
   */
  static async findById(${primaryKey}) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM ${tableName} WHERE ${primaryKey} = ?',
        [${primaryKey}]
      );
      return rows[0] || null;
    } catch (error) {
      logger.error('Error finding ${className.toLowerCase()} by ${primaryKey}', error);
      throw error;
    }
  }

  /**
   * Get all ${className.toLowerCase()}s
   * @returns {Promise<Array>}
   */
  static async getAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM ${tableName}');
      return rows;
    } catch (error) {
      logger.error('Error getting all ${className.toLowerCase()}s', error);
      throw error;
    }
  }

  /**
   * Create new ${className.toLowerCase()}
   * @param {object} data - ${className} data
   * @returns {Promise<object>}
   */
  static async create(data) {
    try {
      const fields = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);

      const [result] = await pool.query(
        \`INSERT INTO ${tableName} (\${fields}) VALUES (\${placeholders})\`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error creating ${className.toLowerCase()}', error);
      throw error;
    }
  }

  /**
   * Update ${className.toLowerCase()}
   * @param {${sqlTypeToJsType(
     columns.find((col) => col.Field === primaryKey)?.Type
   )}} ${primaryKey}
   * @param {object} data - Fields to update
   * @returns {Promise<object>}
   */
  static async update(${primaryKey}, data) {
    try {
      const fields = Object.keys(data).map(key => \`\${key} = ?\`).join(', ');
      const values = [...Object.values(data), ${primaryKey}];

      const [result] = await pool.query(
        \`UPDATE ${tableName} SET \${fields} WHERE ${primaryKey} = ?\`,
        values
      );
      return result;
    } catch (error) {
      logger.error('Error updating ${className.toLowerCase()}', error);
      throw error;
    }
  }

  /**
   * Delete ${className.toLowerCase()}
   * @param {${sqlTypeToJsType(
     columns.find((col) => col.Field === primaryKey)?.Type
   )}} ${primaryKey}
   * @returns {Promise<object>}
   */
  static async delete(${primaryKey}) {
    try {
      const [result] = await pool.query(
        'DELETE FROM ${tableName} WHERE ${primaryKey} = ?',
        [${primaryKey}]
      );
      return result;
    } catch (error) {
      logger.error('Error deleting ${className.toLowerCase()}', error);
      throw error;
    }
  }

  /**
   * Count total ${className.toLowerCase()}s
   * @returns {Promise<number>}
   */
  static async count() {
    try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM ${tableName}');
      return rows[0].count;
    } catch (error) {
      logger.error('Error counting ${className.toLowerCase()}s', error);
      throw error;
    }
  }
}

export default ${className};
`;

  return content;
}

// Main function
async function retrieveDatabase() {
  try {
    console.log("========================================");
    console.log("   Database Schema Retrieval");
    console.log("========================================\n");

    // Get all tables
    console.log("📊 Scanning database for tables...");
    const tables = await getAllTables();

    if (tables.length === 0) {
      console.log("⚠️  No tables found in database");
      return;
    }

    console.log(`✓ Found ${tables.length} table(s):\n`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table}`);
    });
    console.log("");

    // Generate models
    const modelsDir = path.join(__dirname, "..", "models");

    // Create models directory if it doesn't exist
    if (!fs.existsSync(modelsDir)) {
      fs.mkdirSync(modelsDir, { recursive: true });
    }

    console.log("📝 Generating model files...\n");

    const generatedModels = [];

    for (const tableName of tables) {
      console.log(`   Processing: ${tableName}`);

      // Get table structure
      const columns = await getTableStructure(tableName);

      // Generate model content
      const modelContent = generateModelContent(tableName, columns);
      const className = generateClassName(tableName);
      const fileName = `${className}.js`;
      const filePath = path.join(modelsDir, fileName);

      // Write model file
      fs.writeFileSync(filePath, modelContent, "utf8");

      console.log(`      ✓ Created: models/${fileName}`);

      generatedModels.push({
        table: tableName,
        model: className,
        file: fileName,
        columns: columns.length,
      });
    }

    console.log("\n========================================");
    console.log("✅ Database Retrieval Complete!");
    console.log("========================================\n");

    console.log("Generated Models Summary:\n");
    generatedModels.forEach((model) => {
      console.log(`   ${model.model}`);
      console.log(`      Table: ${model.table}`);
      console.log(`      Columns: ${model.columns}`);
      console.log(`      File: ${model.file}\n`);
    });

    console.log("Next Steps:");
    console.log("   1. Review generated models in Backend-Node/models/");
    console.log("   2. Create routes for each model if needed");
    console.log("   3. Update server.js to include new routes");
    console.log("");
  } catch (error) {
    console.error("\n❌ Error retrieving database:", error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

retrieveDatabase();
