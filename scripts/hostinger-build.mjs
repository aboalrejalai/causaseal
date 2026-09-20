import { accessSync, constants, cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const entry = path.join(root, "server.js");
const stageDir = path.join(root, ".hostinger-static");

accessSync(publicDir, constants.R_OK);
accessSync(entry, constants.R_OK);
accessSync(path.join(publicDir, "dashboard.html"), constants.R_OK);

// Keep a verified static snapshot Hostinger can detect even if it looks for an output folder.
rmSync(stageDir, { recursive: true, force: true });
mkdirSync(stageDir, { recursive: true });
cpSync(publicDir, stageDir, { recursive: true });

if (!existsSync(path.join(stageDir, "dashboard.html"))) {
  throw new Error("Static snapshot missing dashboard.html");
}

console.log("[CAUSASEAL] Hostinger build OK");
console.log("[CAUSASEAL] entry=server.js");
console.log(`[CAUSASEAL] static=${publicDir}`);
console.log(`[CAUSASEAL] snapshot=${stageDir}`);
