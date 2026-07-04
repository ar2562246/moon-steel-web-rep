import { cp, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const moonsteelDir = path.join(repoRoot, "artifacts", "moonsteel");
const apiServerDir = path.join(repoRoot, "artifacts", "api-server");
const sourceNextDir = path.join(moonsteelDir, ".next");
const targetNextDir = path.join(apiServerDir, ".next");

// When Vercel Root Directory is still artifacts/api-server, copy the Next.js
// build output where the platform expects it.
await rm(targetNextDir, { recursive: true, force: true });
await cp(sourceNextDir, targetNextDir, { recursive: true });

console.log(`Synced Next.js output: ${sourceNextDir} -> ${targetNextDir}`);
