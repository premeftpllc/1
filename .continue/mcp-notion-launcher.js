import { execFileSync, spawn } from "node:child_process";

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

const token =
  process.env.NOTION_TOKEN ??
  getPersistentWindowsEnvironmentVariable("NOTION_TOKEN");

if (!token) {
  throw new Error("NOTION_TOKEN is not available to the Notion MCP launcher.");
}

const command = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "npx";
const args =
  process.platform === "win32"
    ? ["/d", "/s", "/c", "npx.cmd -y @notionhq/notion-mcp-server"]
    : ["-y", "@notionhq/notion-mcp-server"];

const child = spawn(command, args, {
  env: { ...process.env, NOTION_TOKEN: token },
  stdio: "inherit",
  windowsHide: true,
});

child.on("error", (error) => {
  throw error;
});

child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});