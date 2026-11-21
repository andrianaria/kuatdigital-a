import mysql from "mysql2/promise";

export function databaseConfigFromEnv(env = process.env) {
  const required = ["DATABASE_HOST", "DATABASE_NAME", "DATABASE_USER", "DATABASE_PASSWORD"];
  const missing = required.filter((key) => !env[key]);
  if (missing.length) {
    throw new Error(`Database belum dikonfigurasi: ${missing.join(", ")}`);
  }

  return {
    host: env.DATABASE_HOST,
    port: Number(env.DATABASE_PORT ?? 3306),
    database: env.DATABASE_NAME,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    ssl:
      env.DATABASE_SSL === "false"
        ? undefined
        : {
            rejectUnauthorized: env.DATABASE_SSL_REJECT_UNAUTHORIZED !== "false",
            ...(env.DATABASE_SSL_CA ? { ca: env.DATABASE_SSL_CA } : {}),
          },
    connectTimeout: 10_000,
  };
}

export function createDatabasePool(env = process.env) {
  return mysql.createPool({
    ...databaseConfigFromEnv(env),
    connectionLimit: 5,
    enableKeepAlive: true,
  });
}
