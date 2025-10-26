import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  console.error("❌ Brak zmiennej DATABASE_URL w pliku .env!");
  process.exit(1); // zatrzymaj serwer, żeby nie działał bez bazy
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
});

export default pool;
