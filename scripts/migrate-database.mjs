import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";

import { createDatabasePool } from "./database-config.mjs";

const pool = createDatabasePool();

try {
  await migrate(drizzle(pool), { migrationsFolder: "drizzle" });
  console.log("Migrasi database selesai.");
} finally {
  await pool.end();
}
