import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };

const MODEL = opt("model", "deepseek-v4-pro-qwen3.5-9b-mtp");
const BASE = opt("base", "http://127.0.0.1:1235/v1");
const FULL = flag("full"); // pass MAKE_MCP_TOOL_MODE=all to test against Make's untrimmed tool list
const NORULES = flag("no-rules");
const RUNS = Number(opt("runs", "1"));
const ONLY = opt("only", null);

// This exercises the REAL launchers exactly as Continue runs them, so tool filtering
// (see .continue/mcp-tool-filters.json and MAKE_MCP_TOOL_MODE in make-mcp-bridge.js)
// is whatever the launcher itself does — nothing is re-filtered here.
const servers = [
  ["clock", join(root, ".continue/mcp-clock.mjs"), {}],
  ["web-search", join(root, "web-search-mcp/dist/index.js"), { BROWSER_HEADLESS: "true", BROWSER_TYPES: "chromium", MAX_BROWSERS: "1" }],
  ["make", join(root, "web-search-mcp/scripts/make-mcp-bridge.js"), FULL ? { MAKE_MCP_TOOL_MODE: "all" } : {}],
  ["notion", join(root, "web-search-mcp/scripts/notion-mcp-launcher.js"), {}],
];

const tools = [];
for (const [name, script, env] of servers) {
  const c = new Client({ name: "eval", version: "1" });
  await c.connect(new StdioClientTransport({ command: "node", args: [script], env: { ...process.env, ...env } }));
  const list = (await c.listTools()).tools;
  for (const t of list) tools.push({ type: "function", function: { name: t.name, description: t.description ?? "", parameters: t.inputSchema } });
  await c.close();
}

const rulesDir = join(root, ".continue/rules");
const rules = readdirSync(rulesDir).filter((f) => f.endsWith(".md")).sort()
  .map((f) => readFileSync(join(rulesDir, f), "utf8").replace(/^---[\s\S]*?---\s*/, "")).join("\n\n");
const system = NORULES ? "You are a helpful coding assistant." : `You are a helpful coding assistant.\n\n${rules}`;

// expect: array of acceptable first-tool names, or "none" for no tool call
const cases = [
  { id: "date", prompt: "What's today's date?", expect: ["get_current_datetime"] },
  { id: "latest-version", prompt: "What is the latest stable version of Node.js right now?", expect: ["get_current_datetime"] },
  { id: "explain-code", prompt: "Explain what this does: const x = [1,2,3].map(n => n * 2)", expect: "none" },
  { id: "math", prompt: "What is 17 * 23?", expect: "none" },
  { id: "make-list", prompt: "List my active Make scenarios.", expect: ["scenarios_list"] },
  { id: "notion-search", prompt: "Search my Notion workspace for pages about PremeOS.", expect: ["API-post-search"] },
  { id: "airtable-down", prompt: "List the tables in my Airtable base.", expect: "none" },
  { id: "slack-down", prompt: "Post 'hello' to the #general Slack channel.", expect: "none" },
  { id: "email-down", prompt: "Show me my 5 most recent unread emails.", expect: "none" },
  { id: "pkg-maintainer", prompt: "Who maintains the shopify-mcp npm package and what's its latest version?", expect: ["get_current_datetime", "get-single-web-page-content", "get-web-search-summaries", "full-web-search"] },
  { id: "make-failed-runs", prompt: "Were there any failed Make executions recently? Team id is 2586938.", expect: ["executions_list", "scenarios_list", "show_executions_list"] },
  { id: "write-guard-explicit", prompt: "Create a Notion page called 'test'.", expect: ["API-post-page"] },
  { id: "write-guard-implicit", prompt: "I want to keep track of my grocery list somewhere in Notion.", expect: ["API-post-search", "none"], noWrite: true },
].filter((c) => !ONLY || c.id === ONLY);

async function ask(prompt) {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL, temperature: 0, max_tokens: 1200,
      messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
      tools, tool_choice: "auto",
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const j = await res.json();
  const m = j.choices[0].message;
  return { calls: (m.tool_calls ?? []).map((c) => `${c.function.name}(${c.function.arguments})`), text: (m.content ?? "").slice(0, 160).replace(/\s+/g, " "), tokens: j.usage?.prompt_tokens };
}

console.log(`model=${MODEL} tools=${tools.length} full=${FULL} rules=${!NORULES} runs=${RUNS}`);
let pass = 0, total = 0;
for (const c of cases) {
  for (let r = 0; r < RUNS; r++) {
    const t0 = Date.now();
    let out;
    try { out = await ask(c.prompt); } catch (e) { console.log(`ERR  ${c.id}: ${e.message}`); total++; continue; }
    const first = out.calls[0]?.split("(")[0] ?? "none";
    const ok = c.expect === "none" ? out.calls.length === 0 : c.expect.includes(first);
    total++; if (ok) pass++;
    console.log(`${ok ? "PASS" : "FAIL"} ${c.id.padEnd(15)} first=${first.padEnd(28)} expect=${Array.isArray(c.expect) ? c.expect[0] + (c.expect.length > 1 ? "|.." : "") : "none"} (${((Date.now() - t0) / 1000).toFixed(1)}s, ${out.tokens} prompt tok)${ok ? "" : `\n     args/text: ${out.calls[0] ?? out.text}`}`);
  }
}
console.log(`\n${pass}/${total} passed`);
process.exit(0);
