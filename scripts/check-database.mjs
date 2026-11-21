import { createDatabasePool } from "./database-config.mjs";

const pool = createDatabasePool();

try {
  const [ssl] = await pool.query("SHOW SESSION STATUS LIKE 'Ssl_cipher'");
  const [tables] = await pool.query("SHOW TABLES");
  console.log(
    JSON.stringify(
      {
        connected: true,
        tls: Boolean(ssl[0]?.Value),
        tableCount: tables.length,
      },
      null,
      2,
    ),
  );
} finally {
  await pool.end();
}
