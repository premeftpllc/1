import { execFileSync, spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  try {
    const envPath = resolve(".continue", ".env.local");
    const content = readFileSync(envPath, "utf8");
    const env = {};
    for (const line of content.split("\n")) {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join("=").trim();
      }
    }
    return env;
  } catch {
    return {};
  }
}

function getPersistentWindowsEnvironmentVariable(name) {
  for (const scope of ["User", "Machine"]) {
    const value = execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `[Environment]::GetEnvironmentVariable('${name}', '${scope}')`,
      ],
      { encoding: "utf8", windowsHide: true },
    ).trim();

    if (value) {
      return value;
    }
  }
}

const envLocal = loadEnvLocal();
const serviceAccount =
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON ??
  envLocal.GOOGLE_SERVICE_ACCOUNT_JSON ??
  getPersistentWindowsEnvironmentVariable("GOOGLE_SERVICE_ACCOUNT_JSON");

if (!serviceAccount) {
  throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not available to the Gmail MCP launcher.");
}

const command = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "npx";
const args =
  process.platform === "win32"
    ? ["/d", "/s", "/c", "npx.cmd -y @klodr/gmail-mcp"]
    : ["-y", "@klodr/gmail-mcp"];

const child = spawn(command, args, {
  env: { ...process.env, GOOGLE_SERVICE_ACCOUNT_JSON: serviceAccount },
  stdio: "inherit",
  windowsHide: true,
});

child.on("error", (error) => {
  throw error;
});

child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
