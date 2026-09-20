import { accessSync, constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(root, "..", "public");
const entry = path.resolve(root, "..", "server.js");

for (const target of [publicDir, entry]) {
  accessSync(target, constants.R_OK);
}

console.log("[CAUSASEAL] Hostinger build OK");
console.log(`[CAUSASEAL] entry=server.js output=${publicDir}`);
