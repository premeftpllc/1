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
const botToken =
  process.env.SLACK_BOT_TOKEN ??
  envLocal.SLACK_BOT_TOKEN ??
  getPersistentWindowsEnvironmentVariable("SLACK_BOT_TOKEN");

const teamId =
  process.env.SLACK_TEAM_ID ??
  envLocal.SLACK_TEAM_ID ??
  getPersistentWindowsEnvironmentVariable("SLACK_TEAM_ID");

if (!botToken) {
  throw new Error("SLACK_BOT_TOKEN is not available to the Slack MCP launcher.");
}

if (!teamId) {
  throw new Error("SLACK_TEAM_ID is not available to the Slack MCP launcher.");
}

const command = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "npx";
const args =
  process.platform === "win32"
    ? ["/d", "/s", "/c", "npx.cmd -y slack-mcp-server"]
    : ["-y", "slack-mcp-server"];

const child = spawn(command, args, {
  env: { ...process.env, SLACK_BOT_TOKEN: botToken, SLACK_TEAM_ID: teamId },
  stdio: "inherit",
  windowsHide: true,
});

child.on("error", (error) => {
  throw error;
});

child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
