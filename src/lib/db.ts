import pg from "pg";
import logger from "./logger";

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      logger.warn("[DB] DATABASE_URL not set — database operations will fail.", { module: "DB" });
    }

    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    });

    pool.on("error", (err: Error) => {
      logger.error(`[DB] Unexpected pool error: ${err.message}`, { module: "DB" });
    });

    pool.on("connect", () => {
      logger.debug("[DB] New client connected to PostgreSQL", { module: "DB" });
    });
  }
  return pool;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  const client = await getPool().connect();
  const start = Date.now();
  try {
    const result = await client.query(sql, params);
    const duration = Date.now() - start;
    logger.debug(`[DB] Query completed in ${duration}ms`, {
      module: "DB",
      data: { duration, rowCount: result.rowCount },
    });
    return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error(`[DB] Query error: ${msg}`, { module: "DB", error: msg });
    throw err;
  } finally {
    client.release();
  }
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const { rows } = await query<T>(sql, params);
  return rows[0] ?? null;
}

export async function transaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function checkConnection(): Promise<boolean> {
  try {
    await query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}

export default { query, queryOne, transaction, checkConnection, getPool };
