import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  try {
    const envPath = join(__dirname, ".env.local");
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

const envLocal = loadEnvLocal();

// Zapier's hosted MCP gives each connected account a unique URL
// (https://mcp.zapier.com/api/mcp/s/<KEY>/mcp) from the account's MCP settings page —
// that URL itself is the credential, there is no separate bearer token to configure.
const mcpUrl = process.env.ZAPIER_MCP_URL ?? envLocal.ZAPIER_MCP_URL;

if (!mcpUrl || mcpUrl.includes("YOUR_")) {
  throw new Error(
    "ZAPIER_MCP_URL is not available to the Zapier MCP bridge. Set it in .continue/.env.local to the per-account URL from https://mcp.zapier.com/."
  );
}

const client = new Client({ name: "zapier-mcp-bridge", version: "1.0.0" });
const remoteTransport = new StreamableHTTPClientTransport(new URL(mcpUrl));

await client.connect(remoteTransport);

const server = new Server(
  { name: "zapier-mcp-bridge", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, () => client.listTools());
server.setRequestHandler(CallToolRequestSchema, (request) =>
  client.callTool(request.params),
);

await server.connect(new StdioServerTransport());
