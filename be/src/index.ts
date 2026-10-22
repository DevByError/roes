import { app } from "./app";
import { config } from "./config";
import { ensureMayor, initDatabase } from "./bootstrap";

try {
  await initDatabase();
  await ensureMayor();
} catch (err) {
  console.error("Startup failed:", err);
  process.exit(1);
}

Bun.serve({ hostname: "0.0.0.0", port: config.PORT, fetch: app.fetch, maxRequestBodySize: 8 * 1024 * 1024, idleTimeout: 30 });
console.log(`ROES API listening on http://localhost:${config.PORT}`);
