import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import * as schema from "./schema";

export type DatabaseConfig = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
  sslRejectUnauthorized: boolean;
  sslCa?: string;
};

export function databaseConfigFromEnv(env: NodeJS.ProcessEnv = process.env): DatabaseConfig {
  const required = ["DATABASE_HOST", "DATABASE_NAME", "DATABASE_USER", "DATABASE_PASSWORD"] as const;
  const missing = required.filter(key => !env[key]);
  if (missing.length) throw new Error(`Database belum dikonfigurasi: ${missing.join(", ")}`);
  return {
    host: env.DATABASE_HOST!,
    port: Number(env.DATABASE_PORT ?? 3306),
    database: env.DATABASE_NAME!,
    user: env.DATABASE_USER!,
    password: env.DATABASE_PASSWORD!,
    ssl: env.DATABASE_SSL !== "false",
    sslRejectUnauthorized: env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
    sslCa: env.DATABASE_SSL_CA,
  };
}

const globalDatabase = globalThis as typeof globalThis & {
  kuatDigitalPool?: mysql.Pool;
};

function createPool() {
  const config = databaseConfigFromEnv();
  return mysql.createPool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: config.ssl
      ? { rejectUnauthorized: config.sslRejectUnauthorized, ...(config.sslCa ? { ca: config.sslCa } : {}) }
      : undefined,
    connectionLimit: 5,
    enableKeepAlive: true,
  });
}

export function databasePool() {
  globalDatabase.kuatDigitalPool ??= createPool();
  return globalDatabase.kuatDigitalPool;
}

export function database() {
  return drizzle(databasePool(), { schema, mode: "default" });
}
