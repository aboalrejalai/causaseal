import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "dist");

const port = parseInt(process.env.PORT || "3000", 10);
const host = process.env.HOST || "0.0.0.0";

console.log(`[CAUSASEAL] Starting production server on ${host}:${port}...`);

if (!existsSync(distDir)) {
  console.error(`[CAUSASEAL] Error: 'dist' directory not found. Run 'npm run build' before starting the server.`);
  process.exit(1);
}

try {
  const { startProdServer } = await import("vinext/server/prod-server");
  await startProdServer({
    port,
    host,
    outDir: distDir,
  });
  console.log(`[CAUSASEAL] Production server running at http://${host}:${port}`);
} catch (err) {
  console.error("[CAUSASEAL] Failed to start server:", err);
  process.exit(1);
}

