import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync, spawnSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Locate git binary dynamically across PATH and GitHub Desktop installations
function resolveGit() {
  try {
    const res = spawnSync("git", ["--version"], { stdio: "ignore" });
    if (res.status === 0) return "git";
  } catch {}

  const localAppData = process.env.LOCALAPPDATA || "";
  const ghDesktop = path.join(localAppData, "GitHubDesktop");
  if (fs.existsSync(ghDesktop)) {
    try {
      const items = fs.readdirSync(ghDesktop).filter((n) => n.startsWith("app-"));
      for (const item of items) {
        const candidate = path.join(ghDesktop, item, "resources", "app", "git", "cmd", "git.exe");
        if (fs.existsSync(candidate)) return candidate;
      }
    } catch {}
  }

  const defaultPaths = [
    "C:\\Program Files\\Git\\cmd\\git.exe",
    "C:\\Program Files\\Git\\bin\\git.exe",
    "C:\\Program Files (x86)\\Git\\cmd\\git.exe",
  ];
  for (const p of defaultPaths) {
    if (fs.existsSync(p)) return p;
  }

  return "git";
}

const git = resolveGit();
console.log(`[auto-push] Using git executable: ${git}`);

const IGNORED_PARTS = new Set([
  ".git",
  "node_modules",
  "dist",
  "dist-ssr",
  ".vite",
  ".tanstack",
  ".gemini",
  ".system_generated",
  ".vscode",
  ".idea",
  "logs",
]);

const IGNORED_EXTENSIONS = new Set([
  ".tmp",
  ".log",
  ".swp",
  ".tsbuildinfo",
  ".zip",
]);

function isIgnored(relPath) {
  if (!relPath) return true;
  const normalized = relPath.replace(/\\/g, "/");
  const parts = normalized.split("/");
  for (const part of parts) {
    if (IGNORED_PARTS.has(part)) return true;
  }
  const ext = path.extname(normalized).toLowerCase();
  if (IGNORED_EXTENSIONS.has(ext)) return true;
  return false;
}

let debounceTimer = null;
const changedFilesSet = new Set();
let isSyncing = false;

function runGit(args) {
  return execSync(`"${git}" ${args}`, {
    cwd: rootDir,
    encoding: "utf-8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function syncChanges() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const status = runGit("status --porcelain").trim();
    if (!status) {
      changedFilesSet.clear();
      isSyncing = false;
      return;
    }

    const fileList = Array.from(changedFilesSet);
    changedFilesSet.clear();

    const timestamp = new Date().toLocaleString("en-GB", {
      dateStyle: "short",
      timeStyle: "medium",
    });

    let summary = fileList.slice(0, 3).join(", ");
    if (fileList.length > 3) {
      summary += ` (+${fileList.length - 3} more)`;
    }
    if (!summary) {
      summary = "workspace updates";
    }

    const commitMsg = `auto: update ${summary} [${timestamp}]`;

    console.log(`[auto-push] Staging changes...`);
    runGit("add -A");

    console.log(`[auto-push] Committing: "${commitMsg}"`);
    runGit(`commit -m "${commitMsg.replace(/"/g, '\\"')}"`);

    console.log(`[auto-push] Pushing to origin main...`);
    runGit("push origin main");

    console.log(`[auto-push] ✅ Successfully committed and pushed to GitHub at ${timestamp}`);
  } catch (err) {
    console.error(`[auto-push] ⚠️ Sync error: ${err.message || err}`);
  } finally {
    isSyncing = false;
  }
}

function triggerSync(filename) {
  if (filename && !isIgnored(filename)) {
    changedFilesSet.add(path.basename(filename));
  }

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Debounce by 3 seconds to batch rapid typing / multiple file saves
  debounceTimer = setTimeout(() => {
    syncChanges();
  }, 3000);
}

// Initial sync on startup to capture any pending changes
console.log("[auto-push] Checking for initial pending changes...");
syncChanges();

// Watch root directory recursively
try {
  fs.watch(rootDir, { recursive: true }, (eventType, filename) => {
    if (!filename || isIgnored(filename)) return;
    triggerSync(filename);
  });
  console.log(`[auto-push] 🚀 Auto-push watcher is active and watching: ${rootDir}`);
  console.log(`[auto-push] Any changes you make will be automatically committed and pushed to GitHub main.`);
} catch (err) {
  console.error(`[auto-push] Failed to start filesystem watcher:`, err);
}
