import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Make exposes 146+ tools; sending them all inflates every prompt by ~40k tokens
// and can exceed a smaller model's context window outright. Default to a curated
// subset (edit .continue/mcp-tool-filters.json to change it). Calls to a filtered-out
// tool still work if something explicitly names one — only the advertised list shrinks.
// Set MAKE_MCP_TOOL_MODE=all to restore the full list for one session.
const toolMode = process.env.MAKE_MCP_TOOL_MODE ?? "trim";
let keepTools = null;
if (toolMode !== "all") {
  // Look next to this script first (~/.continue/.continue/), then the original location
  // relative to web-search-mcp/scripts/ (continue-demo/.continue/). The live copy was moved
  // during consolidation and silently lost its filter, exposing all ~150 Make tools.
  const candidates = [
    join(__dirname, "mcp-tool-filters.json"),
    join(__dirname, "..", "..", ".continue", "mcp-tool-filters.json"),
  ];
  for (const file of candidates) {
    try {
      keepTools = new Set(JSON.parse(readFileSync(file, "utf8")).make ?? []);
      break;
    } catch {}
  }
  if (!keepTools) {
    // stderr only - stdout is the MCP protocol channel and must stay clean
    console.error("[make-bridge] WARNING: mcp-tool-filters.json not found; exposing the FULL Make tool list. Looked in: " + candidates.join(" | "));
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

const token =
  process.env.MAKE_MCP_AUTHORIZATION ??
  getPersistentWindowsEnvironmentVariable("MAKE_MCP_AUTHORIZATION");

if (!token) {
  throw new Error("MAKE_MCP_AUTHORIZATION is not available to the Make MCP bridge.");
}

const client = new Client({ name: "make-mcp-bridge", version: "1.0.0" });
const remoteTransport = new StreamableHTTPClientTransport(
  new URL("https://us2.make.com/mcp"),
  {
    requestInit: {
      headers: { Authorization: `Bearer ${token}` },
    },
  },
);

await client.connect(remoteTransport);

const server = new Server(
  { name: "make-mcp-bridge", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const result = await client.listTools();
  if (!keepTools) return result;
  return { ...result, tools: result.tools.filter((t) => keepTools.has(t.name)) };
});
server.setRequestHandler(CallToolRequestSchema, (request) =>
  client.callTool(request.params),
);

await server.connect(new StdioServerTransport());