# PC Sync Task: Transfer Secrets to ~/.continue/.env

**Status:** PENDING  
**Created:** 2026-09-23  
**Updated:** 2026-09-24  
**Priority:** Medium  
**Owner Decision Required:** Yes

---

## Important: Never Sync Secrets Through Git

Secrets must never be committed to GitHub or shared through git. They are sensitive credentials that belong only on each machine's local `.env` file.

---

## Correct File and Naming on Both Machines

Continue reads `~/.continue/.env`, not `.env.local`. The variable names have also been corrected to match Continue 2.0.0 and the verified MCP packages.

### Continue Secret Lookup
Continue searches for secrets in this order (first match wins):
1. `~/.continue/.env`
2. `<workspace>/.continue/.env`
3. `<workspace>/.env`
4. VS Code process environment

**.env.local is NEVER read** — if you have credentials in `.env.local`, move them to `~/.continue/.env` and `chmod 600` it.

---

## Variable Name Mapping

| Old (Incorrect) | New (Correct) | Server |
|-----------------|---------------|--------|
| `AIRTABLE_TOKEN` | `AIRTABLE_API_KEY` | Airtable MCP |
| `SLACK_BOT_TOKEN` | `SLACK_MCP_XOXB_TOKEN` (bot) or `SLACK_MCP_XOXP_TOKEN` (user) | Slack MCP |
| `NOTION_TOKEN` | `NOTION_TOKEN` (unchanged) | Notion MCP |

### Slack Token Status (PC)
**Current PC Slack token is broken:** The value you have is an xoxe- refresh token, not a bot token. Refresh tokens do not work with MCP servers.

**Action:** Reinstall the Slack app at https://api.slack.com/apps to generate a fresh xoxb- bot token.

---

## Steps (PC)

### 1. Create `~/.continue/.env` (or Equivalent on PC)
On Windows, this is `C:\Users\<username>\.continue\.env`.

```bash
touch ~/.continue/.env
chmod 600 ~/.continue/.env
```

### 2. Populate with Correct Names
Add these lines and fill in actual values:
```
NOTION_TOKEN=ntn_<your-internal-integration-secret>
AIRTABLE_API_KEY=pat<_or_ucl_><your-pat>
SLACK_MCP_XOXB_TOKEN=xoxb-<your-bot-token>
```

### 3. Do NOT Commit to Git
`.env` is already in `.gitignore`. Verify:
```bash
git status
# Should NOT show ~/.continue/.env
```

### 4. Mac Will Not Accept GitHub Sync
**Never try to push `.env` to GitHub.** Each machine keeps its own `.env` with machine-specific paths and credentials.

---

## Steps (Mac — after PC completes)

Once the PC has created its `~/.continue/.env`, the Mac operator should:

### 1. Obtain Secrets Securely
Ask the PC operator to share the same credentials by password manager, AirDrop, or secure message — NOT through git/GitHub.

### 2. Create `~/.continue/.env` on Mac
```bash
touch ~/.continue/.env
chmod 600 ~/.continue/.env
```

### 3. Add Credentials with Correct Names
```
NOTION_TOKEN=ntn_<your-internal-integration-secret>
AIRTABLE_API_KEY=pat<_or_ucl_><your-pat>
SLACK_MCP_XOXB_TOKEN=xoxb-<your-bot-token>
```

### 4. Run the Activation Tasks
1. **Terminal → Run Task → PremeOS: Check Continue MCP**
   - Verifies ~/.continue/.env exists and checks which servers are ready
2. **Terminal → Run Task → PremeOS: Enable ready MCP servers**
   - Copies each ready server block into ~/.continue/mcpServers/
3. **Developer: Reload Window**

### 5. Verify in Continue
- Open Continue chat
- Toggle **Agent mode**
- Try: `@notion`, `@airtable`, `@slack` to confirm tools are available

---

## Rotate Exposed Secrets

A live Make MCP token is currently visible on the Notion page "MCP Configuration Sync - Windows to Mac". This token must be rotated before being transferred anywhere:

1. Go to https://us2.make.com/profile#api-access
2. Revoke the exposed key
3. Generate a new API key
4. Update both `~/.continue/.env` files with the new key

---

## Reference

For credential details and how to obtain them, see [docs/CONTINUE-MCP-ARCHITECTURE.md](docs/CONTINUE-MCP-ARCHITECTURE.md):
- Notion internal integration setup
- Airtable PAT scopes
- Slack bot token (xoxb-) vs user token (xoxp-)
- Why xoxe- refresh tokens don't work
