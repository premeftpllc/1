// Handshake-test the shared MCP blocks the way Continue would start them: initialize + tools/list.
// Prints tool counts only. Secrets come from ~/.continue/.env and are masked in any error output.
// Usage: node scripts/mcp-probe.mjs [name-filter]   (run `python3 scripts/workspace.py setup` first)
import { readFileSync, readdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(join(repo, "web-search-mcp", "package.json"));
const yaml = require("js-yaml");

const env = {};
for (const line of readFileSync(join(homedir(), ".continue", ".env"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
const secretValues = Object.values(env).filter((v) => v.length >= 8);
const mask = (s) => secretValues.reduce((acc, v) => acc.split(v).join("<redacted>"), String(s));
const fill = (s) => s.replace(/\$\{\{\s*secrets\.([A-Za-z0-9_]+)\s*\}\}/g, (_, k) => env[k] ?? "");
const init = { jsonrpc: "2.0", id: 1, method: "initialize",
  params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "probe", version: "1" } } };

function probeStdio(server) {
  return new Promise((resolve) => {
    const serverEnv = Object.fromEntries(Object.entries(server.env ?? {}).map(([k, v]) => [k, fill(String(v))]));
    const isBatch = process.platform === "win32" && ["npx", "uvx", "npm"].includes(server.command);
    const [cmd, args] = isBatch ? ["cmd.exe", ["/c", server.command, ...server.args]] : [server.command, server.args];
    const child = spawn(cmd, args, { env: { ...process.env, ...serverEnv }, windowsHide: true });
    let out = "", err = "", finished = false;
    child.stdin.on("error", () => {});
    const done = (result) => { if (finished) return; finished = true; clearTimeout(timer); child.kill(); resolve(result); };
    const timer = setTimeout(() => done(`TIMEOUT after 90s ${mask(err.trim().split(/\r?\n/).pop() ?? "")}`), 90000);
    child.stdout.on("data", (d) => {
      out += d;
      for (const line of out.split("\n")) {
        try {
          const msg = JSON.parse(line);
          if (msg.id === 1) {
            child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
            child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }) + "\n");
          }
          if (msg.id === 2) done(msg.result ? `OK ${msg.result.tools.length} tools` : `ERROR ${mask(JSON.stringify(msg.error))}`);
        } catch { /* partial line */ }
      }
    });
    child.stderr.on("data", (d) => { err += d; });
    child.on("exit", (code) => done(`EXITED ${code}: ${mask(err.trim().split(/\r?\n/).slice(-2).join(" | ")).slice(0, 220)}`));
    child.stdin.write(JSON.stringify(init) + "\n");
  });
}

async function probeHttp(server) {
  const headers = { "Content-Type": "application/json", Accept: "application/json, text/event-stream" };
  for (const [k, v] of Object.entries(server.requestOptions?.headers ?? {})) headers[k] = fill(String(v));
  if (server.apiKey) headers.Authorization = `Bearer ${fill(server.apiKey)}`;
  const url = fill(server.url);
  const parse = async (res) => {
    const text = await res.text();
    const line = text.split("\n").find((l) => l.startsWith("data:"));
    return JSON.parse(line ? line.slice(5) : text);
  };
  try {
    const r1 = await fetch(url, { method: "POST", headers, body: JSON.stringify(init) });
    if (!r1.ok) return `HTTP ${r1.status}`;
    await parse(r1);
    const sid = r1.headers.get("mcp-session-id");
    if (sid) headers["mcp-session-id"] = sid;
    await fetch(url, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) });
    const r2 = await fetch(url, { method: "POST", headers, body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }) });
    const msg = await parse(r2);
    return msg.result ? `OK ${msg.result.tools.length} tools` : `ERROR ${mask(JSON.stringify(msg.error))}`;
  } catch (e) {
    return `FAILED ${mask(e.message)}`;
  }
}

const only = process.argv[2];
for (const file of readdirSync(join(repo, "config", "continue", "mcpServers")).sort()) {
  if (only && !file.includes(only)) continue;
  const text = readFileSync(join(repo, "config", "continue", "mcpServers", file), "utf8").replaceAll("{{PREMEOS_REPO}}", repo.replaceAll("\\", "/"));
  for (const server of yaml.load(text).mcpServers) {
    const result = server.type === "streamable-http" ? await probeHttp(server) : await probeStdio(server);
    console.log(`${file.padEnd(26)} ${server.name.padEnd(16)} ${result}`);
  }
}
