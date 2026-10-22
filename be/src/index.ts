import { app } from "./app";
import { config } from "./config";
import { ensureMayor, initDatabase } from "./bootstrap";

Bun.serve({ hostname: "0.0.0.0", port: config.PORT, fetch: app.fetch, maxRequestBodySize: 8 * 1024 * 1024, idleTimeout: 30 });
console.log(`ROES API listening on http://localhost:${config.PORT}`);

// Open the port first so hosts that probe it (Render) don't time out while the DB is slow to connect.
const started = Date.now();
try {
  await initDatabase();
  await ensureMayor();
  console.log(`Database ready in ${Date.now() - started}ms`);
} catch (err) {
  console.error("Startup failed:", err);
  process.exit(1);
}
