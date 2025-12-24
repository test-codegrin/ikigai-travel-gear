import mysql from "mysql2/promise";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+00:00",
});

// Test connection on startup
pool
  .getConnection()
  .then((connection) => {
    console.log("✅ Database connected successfully");
    console.log(`📊 Connected to: ${process.env.DB_NAME} at ${process.env.DB_HOST}`);
    connection.release();
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error.message);
  });

export default pool;

export async function query<T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params?: (string | number | boolean | null | Date)[]
): Promise<T> {
  const [results] = await pool.execute<T>(sql, params);
  return results;
}

// Helper for SELECT queries
export async function selectQuery<T extends RowDataPacket>(
  sql: string,
  params?: (string | number | boolean | null | Date)[]
): Promise<T[]> {
  const [results] = await pool.execute<T[]>(sql, params);
  return results;
}

// Helper for INSERT/UPDATE/DELETE queries
export async function mutationQuery(
  sql: string,
  params?: (string | number | boolean | null | Date)[]
): Promise<ResultSetHeader> {
  const [results] = await pool.execute<ResultSetHeader>(sql, params);
  return results;
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error("Database test failed:", error);
    return false;
  }
}
