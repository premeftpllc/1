import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  { name: "clock", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

const tool = {
  name: "get_current_datetime",
  description:
    "Returns the real current date, time, weekday and timezone from this computer's clock. Call this first whenever the date or time matters, or before judging whether any information is recent or outdated.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
};

server.setRequestHandler(ListToolsRequestSchema, () => ({ tools: [tool] }));

server.setRequestHandler(CallToolRequestSchema, (request) => {
  if (request.params.name !== tool.name) {
    return { isError: true, content: [{ type: "text", text: `Unknown tool: ${request.params.name}` }] };
  }
  const now = new Date();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const local = now.toLocaleString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "numeric", minute: "2-digit", second: "2-digit", timeZoneName: "short",
  });
  const pad = (n) => String(n).padStart(2, "0");
  const isoDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const text =
    `Current local date and time: ${local}\n` +
    `ISO date: ${isoDate}\n` +
    `Year: ${now.getFullYear()}\n` +
    `Timezone: ${tz}\n` +
    `UTC: ${now.toISOString()}\n` +
    `Note: this is the real present. Any information dated on or before ${isoDate} is in the past.`;
  return { content: [{ type: "text", text }] };
});

await server.connect(new StdioServerTransport());
