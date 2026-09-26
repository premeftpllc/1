# Continue MCP Architecture

**Status:** 2026-09-26 — one `main` branch for the PC, MacBook Neo and Mac mini; the PC's setup is
the reference. All 8 servers verified on the PC with `node scripts/mcp-probe.mjs`.
**Setting up a machine?** Follow [NEW-MACHINE-SETUP.md](NEW-MACHINE-SETUP.md); this page explains
how the pieces work.

---

## How Continue Loads MCP Servers and Secrets

### Secret Expansion
Continue expands secrets **only** as `${{ secrets.NAME }}`. Lookup order (first match wins):
1. `~/.continue/.env`
2. `<workspace>/.continue/.env`
3. `<workspace>/.env`
4. VS Code process environment

Plain `${VAR}` in YAML is NOT expanded (it is passed literally to the server). `.env.local` is never
read by Continue (some old launchers read it themselves; the shared blocks do not use them).

### Server Loading
Block files in `~/.continue/mcpServers/` are auto-loaded as YAML blocks with `name`, `version` and
`schema`. MCP tools are offered to the model in **Agent** mode only, and Continue asks before running
a tool unless you change that tool's policy.

### How the shared blocks reach each machine
Canonical blocks live in `config/continue/mcpServers/premeos-*.yaml` (secret-free, in git).
`python3 scripts/workspace.py mcp --apply` (also run by `workspace.py secrets`) copies a block to
`~/.continue/mcpServers/` only when every `${{ secrets.X }}` it uses is in `~/.continue/.env` and
every repo file it needs exists. It replaces `{{PREMEOS_REPO}}` with that machine's clone path, and
deletes `premeos-*` blocks that are no longer in the repo. Comment lines of the form
`# requires {{PREMEOS_REPO}}/<path>` declare extra files a block needs.

---

## MCP Server Reference Table

| Server name | Block | Runs | Secrets | Tools |
|---|---|---|---|---|
| `clock` | premeos-clock | `node .continue/mcp-clock.mjs` | — | 1 |
| `web-search` | premeos-web-search | `node web-search-mcp/dist/index.js` (Playwright Chromium; built by `workspace.py setup`) | — | 3 |
| `make-custom-mcp` | premeos-make | `node .continue/mcp-make-bridge.js`: bridge to `https://us2.make.com/mcp` that keeps the 42 tools in `.continue/mcp-tool-filters.json` | `MAKE_MCP_AUTHORIZATION` | 42 |
| `notion` | premeos-notion | `npx -y @notionhq/notion-mcp-server@2.5.2` | `NOTION_TOKEN` | 24 |
| `airtable` | premeos-airtable | streamable HTTP `https://mcp.airtable.com/mcp` | `AIRTABLE_TOKEN` | 46 |
| `slack` | premeos-slack | `npx -y slack-mcp-server@1.3.0 --transport stdio` | `SLACK_MCP_XOXP_TOKEN`, `SLACK_TEAM_ID` | 15 |
| `shopify` | premeos-shopify | `npx -y shopify-mcp@1.0.8` (live store with write tools: keep "Ask first") | `MYSHOPIFY_DOMAIN`, `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET` | 14 |
| `zapier` | premeos-zapier | streamable HTTP, URL from the secret | `ZAPIER_MCP_URL` | 1 |

The server names matter: the rules in `.continue/rules/` call `clock` → `get_current_datetime`,
`web-search` → `get-web-search-summaries` / `full-web-search` / `get-single-web-page-content`, and
`make-custom-mcp` by name. Changing a server means updating the rules in the same commit.

Make's 42-tool subset still includes 13 write-capable tools (for example `scenarios_delete`,
`scenarios_run`); keep them on "Ask first". `MAKE_MCP_TOOL_MODE=all` exposes the full ~146.

### Not configured (owner action needed)

| Service | State |
|---|---|
| Gmail, Google Calendar | Launchers exist in `.continue/`. Real calls fail until the Gmail and Calendar APIs are enabled in GCP project `851326606267`. OAuth tokens from a consent screen in Testing mode expire after 7 days. |
| Google Drive | Excluded on purpose: 128 tools, about 34K tokens per request, and it times out when launched by Continue. |

---

## Credential How-Tos

### Notion Internal Integration
1. Go to https://www.notion.so/my-integrations and click **New integration**
2. Name it, select the workspace, click **Create**
3. Copy the **Internal Integration Secret** (`ntn_...`) into `secrets/premeos.env` as `NOTION_TOKEN`
4. Share individual pages/databases with the integration (page menu → **Connections**)

### Airtable Personal Access Token
1. https://airtable.com/create/tokens → **Create new token**
2. Scopes: `schema.bases:read`, `data.records:read`; add `data.records:write` only if writes are needed
3. Store it as `AIRTABLE_TOKEN` (the synced file also carries `AIRTABLE_API_KEY` with the same value)

### Slack Tokens
The block uses the **user token** (`xoxp-`, `SLACK_MCP_XOXP_TOKEN`) because the bot token fails with
`missing_scope`: its scopes were added under *User Token Scopes*. For least privilege, move the scopes
to *Bot Token Scopes* at https://api.slack.com/apps, reinstall the app, and change the block to
`SLACK_MCP_XOXB_TOKEN`. `xoxe-` refresh tokens do not work.

---

## Secret sync (SOPS + age)

`secrets/premeos.env` on `main` holds all MCP secrets, encrypted (SOPS, AES256-GCM). `.sops.yaml`
lists the age recipients. Each machine has its **own** age key at `~/.config/sops/age/keys.txt`
(mode 600); private keys never leave their machine, only public keys (`age1...`) are shared.

- **Sync:** `python3 scripts/workspace.py secrets` (task **PremeOS: Sync MCP secrets**) fetches
  `origin/main`, decrypts to `~/.continue/.env` without printing values (the old file is replaced only
  when decryption succeeds), then runs `mcp --apply`. Reload the window afterwards.
- **Recipients (2026-09-26):** PC `age1p4tglv0w…`, MacBook Neo
  `age1ejegjy9myh9sx6y9tkfw56ht266v0y5jee2a493ancrpzye3wa9szs9e07`. The Mac mini is added during its
  setup ([NEW-MACHINE-SETUP.md step 3](NEW-MACHINE-SETUP.md#3-encryption-key-age--one-per-machine-private-key-never-leaves-it)).
- **Add a machine:** a machine that can already decrypt adds the new public key to `.sops.yaml`, runs
  `sops updatekeys -y secrets/premeos.env`, commits and pushes.
- **Rotate or add a secret:** `sops secrets/premeos.env` on a recipient machine, commit, push; every
  machine runs `secrets`.
- `path_regex` in `.sops.yaml` uses `.` instead of a path separator on purpose (Windows passes
  `secrets\premeos.env`). `.gitattributes` marks `secrets/**` as `-text` so line-ending conversion can
  never alter the ciphertext.

---

## Packages That Do Not Work

- `@airtable/mcp-cli` — a CLI, exits with code 2, not a server
- `@airtable/mcp-server`, `@anthropic-ai/gmail-mcp-server`, `notion-mcp`, `@modelcontextprotocol/server-git` — do not exist on npm
- `@modelcontextprotocol/server-slack` — deprecated
- `make-custom-mcp` is not an npm package; it is the server name of this repo's Make bridge

---

## Troubleshooting

- **Blank Models/Tools tab:** a schema error in `~/.continue/config.yaml` or a block. Continue fails
  silently and falls back to empty state. Rerun `workspace.py config --apply` and `mcp --apply`.
- **A server fails to start:** run `node scripts/mcp-probe.mjs <name>`. `EXITED` or `MISSING file`
  means a path or dependency problem (rerun `workspace.py setup`), not usually credentials.
- **Literal `${VAR}` in a config:** Continue never expands it; `workspace.py mcp` warns about it.
- **Rules applied twice:** Continue loads `~/.continue/rules` and `<workspace>/.continue/rules` without
  de-duplicating. Rules live only in the repo; keep `~/.continue/rules` empty.
- **Continue logs:** View → Output → **Continue**; the Tools section of the Continue panel shows each
  server's status.

---

## Rollback

- `workspace.py config --apply` backs up the previous `~/.continue/config.yaml` to
  `~/.continue/backups/config-<timestamp>.yaml`.
- Remove all shared blocks with `rm ~/.continue/mcpServers/premeos-*.yaml`, then reload the window.
- PC only: the pre-2026-09-26 layout (the repo inside `~/.continue`, launchers, `.env.local`) is
  archived intact at `C:\Users\Administrator\.continue-backups\2026-09-26-repo-move\`.

## Reference

- [Continue documentation](https://docs.continue.dev)
- Notion: https://www.npmjs.com/package/@notionhq/notion-mcp-server
- Slack: https://www.npmjs.com/package/slack-mcp-server (korotovsky)
- Shopify: https://www.npmjs.com/package/shopify-mcp
