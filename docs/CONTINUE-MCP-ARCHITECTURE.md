# Continue MCP Architecture

**Status:** 2026-09-24 — Verified on macOS with Continue 2.0.0  
**Location:** Secrets in `~/.continue/.env`; server definitions in `config/continue/mcpServers/`

---

## How Continue Loads MCP Servers and Secrets

### Secret Expansion
Continue expands secrets **only** as `${{ secrets.NAME }}`. Lookup order (first match wins):
1. `~/.continue/.env`
2. `<workspace>/.continue/.env`
3. `<workspace>/.env`
4. VS Code process environment

**Important:** Plain `${VAR}` in YAML is NOT expanded (passed literally to the server). `.env.local` is NEVER read.

### Server Loading
`mcpServers` is a **list**. Block files in `~/.continue/mcpServers/` and `<workspace>/.continue/mcpServers/` are auto-loaded as YAML blocks with `name`, `version`, and `schema`. MCP tools appear in Agent mode.

---

## MCP Server Reference Table

| Server | Package | Secret Names | Status |
|--------|---------|--------------|--------|
| Notion | `npx -y @notionhq/notion-mcp-server@2.5.2` | `NOTION_TOKEN` | Ready when secret set |
| Airtable | `npx -y airtable-mcp-server@1.14.0` | `AIRTABLE_API_KEY` | Ready when secret set |
| Slack | `npx -y slack-mcp-server@1.3.0 --transport stdio` | `SLACK_MCP_XOXB_TOKEN` (bot) or `SLACK_MCP_XOXP_TOKEN` (user) | Ready when secret set; startup fails if token is invalid |
| Time | `uvx mcp-server-time` | (none) | Active (no credentials) |
| Web search | `uvx duckduckgo-mcp-server@0.7.0` | (none) | Active; 3 tools, search verified live 2026-09-24 |
| Make | `streamable-http` `https://us2.make.com/mcp`, header `Authorization: Bearer` | `MAKE_MCP_AUTHORIZATION` | Added 2026-09-24; about 146 tools (~40K tokens), so switch it off in Continue > Tools when not needed. The token is due for rotation. |
| Zapier | `streamable-http` url from secret | `ZAPIER_MCP_URL` | Added 2026-09-24; confirm it connects in Continue > Tools |
| Shopify | `npx -y shopify-mcp@1.0.8` | `MYSHOPIFY_DOMAIN`, `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET` | Added 2026-09-24; live store with write tools, so keep "Ask first"; confirm it connects in Continue > Tools |

**Count:** 8 servers configured (Google Drive intentionally excluded: 128 tools, about 34K tokens). Gmail and Calendar are pending OAuth. 24 Notion tools, 16 Airtable tools (read scopes always; write scopes optional), Slack varies by token type, 2 time tools.

---

## Setup Steps

### 1. Create and Fill `~/.continue/.env`

```bash
touch ~/.continue/.env
chmod 600 ~/.continue/.env
```

Edit with:
```
NOTION_TOKEN=ntn_<your-internal-integration-secret>
AIRTABLE_API_KEY=pat<your-personal-access-token>
SLACK_MCP_XOXB_TOKEN=xoxb-<your-bot-token>
```

**Never include these in git or `.gitignore` exceptions.**

### 2. Run VS Code Tasks

1. Open PremeOS workspace in VS Code
2. Run **Terminal → Run Task → PremeOS: Check Continue MCP**
   - Verifies ~/.continue/.env and checks which servers are ready
3. Run **Terminal → Run Task → PremeOS: Enable ready MCP servers**
   - Copies each ready server block into ~/.continue/mcpServers/
4. Run **Developer: Reload Window**

### 3. Use Agent Mode

In the Continue chat input, choose **Agent** in the mode selector. MCP tools are offered to the model only in Agent mode; the model calls them itself (they are not @-mentions). Continue asks before running a tool unless you change that tool's policy.

---

## Credential How-Tos

### Notion Internal Integration
1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Name it; select workspace; click "Create"
4. Copy the **Internal Integration Secret** (ntn_...)
5. Share individual pages/databases with the integration

The integration sees only the pages and databases shared with it (page menu, **Connections**).

### Airtable PAT (Personal Access Token)
1. Go to https://airtable.com/create/tokens (or account settings)
2. Click "Create new token"
3. Name: "PremeOS MCP"
4. Add scopes:
   - `schema.bases:read` (list bases)
   - `data.records:read` (read records) — must-have
   - `data.records:write` (optional; write records)
5. Click "Create"; copy the token

**Scopes:** If write operations are needed, add `data.records:write`. The server reports errors for missing scopes.

### Slack Token
**Bot token (xoxb-):** For posting/reading as the app
1. Go to https://api.slack.com/apps
2. Create or select an app
3. OAuth & Permissions: add the **Bot Token Scopes** listed in the slack-mcp-server README (read scopes such as `channels:history`, `channels:read`, `users:read`; add `chat:write` only if you enable posting)
4. Install the app, then copy the **Bot User OAuth Token** (xoxb-...)
5. Invite the bot to each channel it should read: `/invite @<bot-name>`

**User token (xoxp-):** set `SLACK_MCP_XOXP_TOKEN` instead when you need search, unreads or channels the bot is not in. Change the block's `env` key to match.

**WARNING:** xoxe- refresh tokens do NOT work. If you have xoxe-, reinstall the Slack app to get a fresh xoxb-.

---

## Secret sync between Mac and PC (SOPS + age)

The PC keeps all MCP secrets encrypted in `secrets/premeos.env` on `origin/main` (SOPS, AES256-GCM; `.sops.yaml` lists the age recipients). Each machine has its **own** age key at `~/.config/sops/age/keys.txt` (mode 600). Private keys never leave their machine; only public keys (`age1...`) are shared.

- Mac: run **PremeOS: Sync MCP secrets** (`python3 scripts/workspace.py secrets`). It fetches `origin/main`, decrypts to `~/.continue/.env` (mode 600, values never printed; the old file is replaced only when decryption succeeds), warns if the Slack value is not `xoxb-`, then runs `mcp --apply`. Reload the window afterwards.
- Add a machine: `age-keygen -o ~/.config/sops/age/keys.txt`, give the public key (`age-keygen -y ~/.config/sops/age/keys.txt`) to an existing recipient, who adds it to `.sops.yaml` and runs `sops updatekeys secrets/premeos.env`, then commits and pushes.
- Rotate a secret: edit it once on the PC with `sops secrets/premeos.env`, push, then sync on each machine.
- Mac public key (2026-09-24): `age1ejegjy9myh9sx6y9tkfw56ht266v0y5jee2a493ancrpzye3wa9szs9e07`

## Next steps (not configured yet)

| Service | Package / endpoint | Secrets / auth | Blocker / owner action |
|---------|-------------------|----------------|------------------------|
| Gmail | @klodr/gmail-mcp v1.3.3 | `GMAIL_OAUTH_PATH` (path to gcp-oauth.keys.json) | OAuth via `npx @klodr/gmail-mcp auth --scopes=<scope>`; BLOCKED until the Gmail API is enabled in the Google Cloud project (2026-09-22 report) |
| Google Calendar | @cocal/google-calendar-mcp v2.6.3 | `GOOGLE_OAUTH_CREDENTIALS` (path to gcp-oauth.keys.json) | Browser OAuth flow or `npx @cocal/google-calendar-mcp auth`; tokens expire in 7 days (test mode) |
| Google Drive | @piotr-agier/google-drive-mcp v2.11.0 | Credentials at ~/.config/google-drive-mcp/gcp-oauth.keys.json (no env var) | `npx @piotr-agier/google-drive-mcp auth`; the PC reports it times out when launched by Continue (unsolved) |
| Shopify | shopify-mcp v1.0.8 | `SHOPIFY_CLIENT_ID` + `SHOPIFY_CLIENT_SECRET` (OAuth preferred) OR `SHOPIFY_ACCESS_TOKEN` + `MYSHOPIFY_DOMAIN` | OAuth 2.0 setup required; can pass via env or command-line |
| Zapier | (Hosted at account URL, not npm) | `ZAPIER_MCP_URL` (unique per account from https://mcp.zapier.com/) | No auth needed; URL endpoint serves as credential |
| Make | (Hosted at https://<MAKE_ZONE>/mcp, e.g., us2.make.com/mcp) | `MAKE_ZONE` + `MCP_TOKEN` OR OAuth | Bearer token auth; ~146 tools, ~40k tokens; PC bridge needs `@modelcontextprotocol/sdk` install (owner consent) |
| Web search (local) | premeftpllc/web-search-mcp fork | (none) | Repo not created; PC build exists but not transferred |

**Tool use:** Gemma-4 does NOT auto-detect tool support via the lmstudio rule for `google/gemma-4-e2b`, but `capabilities: [tool_use]` in config.yaml enables it. Added to ~/.continue/config.yaml and copied to config/continue.local.yaml.

---

## Packages That Do Not Work

These package names are invalid or not servers; they will fail to start:
- `@airtable/mcp-cli` — a CLI, exits code 2, not a server
- `@airtable/mcp-server` — nonexistent on npm
- `@anthropic-ai/gmail-mcp-server` — nonexistent
- `make-custom-mcp` — nonexistent
- `notion-mcp` — nonexistent
- `@modelcontextprotocol/server-git` — nonexistent
- `@modelcontextprotocol/server-slack` — deprecated

**Use the verified packages listed in the Server Reference Table above.**

---

## Mac and PC

### Shared Across Devices (via git)
- Which servers exist and their npm package names and startup args
- Continue rules, make tool-filter list, docs

### Kept Local on Each Machine
- Secrets in `~/.continue/.env` (never committed)
- Model choice (Gemma on Mac, Qwen/Nemotron on PC)
- Absolute paths and machine-specific environment

### Architecture
Canonical per-server block files live in `config/continue/mcpServers/premeos-*.yaml` (secret-free, shared via git). Each machine keeps secrets in `~/.continue/.env`. The task `python3 scripts/workspace.py mcp --apply` copies a block into `~/.continue/mcpServers/` only when all its secrets are present.

### GitHub Branch Conflict
- `origin/main` = PC's `C:\Users\Administrator\.continue` folder (Windows paths, Qwen/Nemotron model, unrelated history)
- `claude/worker-1-kz0ycj` = PremeOS workspace (this branch)

**Never merge main into the workspace branch.** The PC's configuration is incompatible with macOS.

### PC Adoption (Pending Owner Decision)
The PC can use the same blocks by pulling this branch, putting its values in `%USERPROFILE%\.continue\.env` with the names above, and running `python scripts/workspace.py mcp --apply`, then retiring its launchers. Not done: it changes the PC setup and the "PC is master" rule, and Windows may need `npx` wrapped as `cmd /c npx` (untested).

### PC Setup Kit on `main`
Commit `414a828` on `origin/main` adds `MACBOOK_NEO_SETUP.md`, `.env.local.example` (names only, no values) and `config.mac.example.yaml`. Its premise that `${{ secrets.NAME }}` needs a Continue Hub login is wrong for Continue 2.0.0: local configs resolve secrets from `~/.continue/.env` (verified in the installed extension code and live on this Mac). Use this guide instead of its two-copy `.env.local` launcher scheme. Its per-service findings (Slack, Airtable, Gmail, Calendar/Drive key shape, Shopify variable names) agree with this guide.

---

## Troubleshooting

### Literal `${VAR}` in Server Config
**Problem:** Server config shows `${{ secrets.TOKEN }}` but server fails to start.  
**Solution:** Check if YAML was edited with old syntax `${TOKEN}`. Continue does not expand `${VAR}` — only `${{ secrets.NAME }}`.

### `.env.local` Not Being Read
**Problem:** Set variables in `.env.local` but servers don't start.  
**Solution:** Continue reads `~/.continue/.env`, not `.env.local`. Rename or use the correct file.

### Slack Server Fails at Startup
**Problem:** MCP panel shows error, server listed as unavailable.  
**Solution:** Verify `SLACK_MCP_XOXB_TOKEN` or `SLACK_MCP_XOXP_TOKEN` is set and valid. If you have an xoxe- refresh token, reinstall the Slack app to get a fresh xoxb-.

### Unresolved Secrets or Malformed Blocks
**Note (from reading the Continue 2.0.0 code):** Unresolved secrets and malformed YAML blocks cause per-block errors, not whole-config failure. Continue skips the affected block (or leaves the literal `${{ secrets.NAME }}` unresolved) and continues loading other blocks. This is why block activation only happens when secrets exist.

### Check Continue Output and MCP Panel
1. **View → Output**, then choose **Continue** in the dropdown
2. In the Continue panel, open settings and check the MCP/Tools section for each server's status
3. Run **PremeOS: Check Continue MCP** for missing secrets, stale copies and literal `${VAR}` warnings

---

## Rollback

Backups are stored in `~/.continue/backups/mcp-fix-<timestamp>/`. To restore:

The 2026-09-24 change is backed up in `~/.continue/backups/mcp-fix-20260924-130833/` (old `config.yaml`, `.env.example`, and the removed `mcpServers/config.yaml` and `mcpServers/README.md`).

```bash
B="$HOME/.continue/backups/mcp-fix-20260924-130833"
rm -f ~/.continue/mcpServers/premeos-*.yaml
cp "$B/config.yaml" ~/.continue/config.yaml
cp "$B/mcpServers/"* ~/.continue/mcpServers/
# Then run Developer: Reload Window
```

This restores the previous (non-working) configuration exactly. Repo changes are reverted with git.

---

## Reference

- [Continue documentation](https://docs.continue.dev)
- Notion: https://www.npmjs.com/package/@notionhq/notion-mcp-server
- Airtable: https://www.npmjs.com/package/airtable-mcp-server
- Slack: https://www.npmjs.com/package/slack-mcp-server (korotovsky; not the deprecated `@modelcontextprotocol/server-slack`)
- Time: https://pypi.org/project/mcp-server-time/
