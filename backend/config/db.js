const mysql = require("mysql2");
const dotenv = require("dotenv");

// Charger les variables d'environnement
dotenv.config();

// Utiliser les variables d'environnement appropriées selon l'environnement
const env = process.env.NODE_ENV || "development";
let dbConfig;

if (env === "test") {
  dbConfig = {
    host: process.env.DB_HOST, 
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  };
} else if (env === "production") {
  dbConfig = {
    host: process.env.DB_PROD_HOST,
    user: process.env.DB_PROD_USERNAME,
    password: process.env.DB_PROD_PASSWORD,
    database: process.env.DB_PROD_DATABASE,
  };
} else {
  // Environnement de développement par défaut
  dbConfig = {
    host: process.env.DB_DEV_HOST,
    user: process.env.DB_DEV_USERNAME,
    password: process.env.DB_DEV_PASSWORD,
    database: process.env.DB_DEV_DATABASE,
  };
}

const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

const db = pool.promise();

// 自动迁移函数
async function migrate() {
    try {
        // 检查 `users` 表是否存在
        const [rows] = await db.query(`
      SELECT COUNT(*) AS count
      FROM information_schema.tables 
      WHERE table_schema = 'trinity' AND table_name = 'users'
    `);

        if (rows[0].count === 0) {
            // 如果表不存在，创建表
            await db.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          first_name VARCHAR(50) NOT NULL,
          last_name VARCHAR(50) NOT NULL,
          phone VARCHAR(20),
          address TEXT,
          zip_code VARCHAR(10),
          city VARCHAR(50),
          country VARCHAR(50),
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
            console.log("`users` 表已成功创建！");
        } else {
            console.log("`users` 表已存在，跳过迁移！");
        }
    } catch (error) {
        console.error("迁移失败：", error.message);
        throw error;
    }
}

module.exports = { db, migrate };