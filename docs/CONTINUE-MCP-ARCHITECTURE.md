# Continue MCP Architecture

**Status:** Configured (awaiting credentials)  
**Last Updated:** 2026-09-22  
**Location:** `~/.continue/config.yaml`

---

## Overview

Continue (VS Code extension) is configured with 6 MCP servers for autonomous AI capabilities:

| MCP | Purpose | Status | Credential Required |
|-----|---------|--------|-------------------|
| **Airtable** | Inventory & database operations | ⏳ Awaiting token | AIRTABLE_TOKEN |
| **Slack** | Team communications & channels | ⏳ Awaiting token | SLACK_BOT_TOKEN, SLACK_TEAM_ID |
| **Notion** | Documentation & databases | ⏳ Awaiting token | NOTION_TOKEN |
| **Google Workspace** | Gmail, Calendar, Drive | ⏳ Awaiting token | GOOGLE_CREDENTIALS_PATH |
| **Make** | Automation workflows | ⏳ Awaiting token | MAKE_API_KEY, MAKE_TEAM_ID |
| **Web Search** | Internet search | ✅ Ready | None |

---

## Architecture

### Config File
- **Location:** `~/.continue/config.yaml`
- **Format:** YAML
- **MCPs:** Defined in `mcpServers` array
- **Auth:** All use environment variables (`${VAR_NAME}`)

### Credential Sources
Create `~/.continue/.env.local` with:

```bash
# Copy from ~/.continue/.env.example and fill in actual values
AIRTABLE_TOKEN=pat_...
SLACK_BOT_TOKEN=xoxb_...
SLACK_TEAM_ID=T_...
NOTION_TOKEN=ntn_...
GOOGLE_CREDENTIALS_PATH=/Users/premeftpllc/.continue/google-credentials.json
MAKE_API_KEY=sk_live_...
MAKE_TEAM_ID=...
MAKE_API_URL=https://us2.make.com/api/v2
```

### MCP Server Details

#### Airtable
- **Package:** `@airtable/mcp-cli`
- **Token:** PAT from https://airtable.com/account/tokens
- **Scopes:** `data.records:read`, `data.records:write`, `schema.bases:read`
- **Use In Continue:** `@airtable list bases`

#### Slack
- **Package:** `slack-mcp-server`
- **Tokens:** Bot token (xoxb-...) + Team ID
- **Setup:** https://api.slack.com/apps → Create New App → OAuth & Permissions
- **Scopes:** channels:history, channels:read, chat:write, groups:read, im:read, users:read
- **Use In Continue:** `@slack list channels`

#### Notion
- **Package:** `@notionhq/notion-mcp-server`
- **Token:** Internal Integration Secret from https://www.notion.so/my-integrations
- **Setup:** Create integration → Share pages/databases with it
- **Use In Continue:** `@notion search pages`

#### Google Workspace
- **Package:** `@gongrzhe/server-gmail-autoauth-mcp`
- **Credentials:** OAuth JSON file
- **Setup:** 
  1. https://console.cloud.google.com → create project
  2. Enable Gmail API, Calendar API, Drive API
  3. Credentials → Create OAuth 2.0 Desktop App → Download JSON
  4. Save as `~/.continue/google-credentials.json`
- **First Run:** Opens browser for OAuth authorization, caches token locally
- **Use In Continue:** `@google search emails`, `@google list events`

#### Make
- **Package:** `make-custom-mcp`
- **Tokens:** API Key + Team ID from https://us2.make.com
- **Setup:** Profile → API → Create new key
- **Use In Continue:** `@make list scenarios`

#### Web Search
- **Package:** `web-search-mcp-server`
- **Credentials:** None required
- **Use In Continue:** `@web-search find information about X`

---

## Activation Checklist

- [ ] Create `~/.continue/.env.local`
- [ ] Fill in AIRTABLE_TOKEN
- [ ] Fill in SLACK_BOT_TOKEN and SLACK_TEAM_ID
- [ ] Fill in NOTION_TOKEN
- [ ] Place `google-credentials.json` at `~/.continue/google-credentials.json`
- [ ] Fill in MAKE_API_KEY, MAKE_TEAM_ID
- [ ] Restart Continue (close/reopen VS Code)
- [ ] Go to Continue → Tools to verify all MCPs show ✅

---

## Testing MCPs

Once credentials are activated:

```
@airtable list bases
@slack list channels
@notion search workspace
@google get recent emails
@make list scenarios
@web-search find Claude documentation
```

---

## Troubleshooting

### MCP not showing in Tools
- Restart VS Code completely (Cmd+Q, reopen)
- Check `~/.continue/config.yaml` syntax (must be valid YAML)
- Verify environment variables are set

### "Token not found" error
- Verify `~/.continue/.env.local` exists with correct variable names
- Restart VS Code
- Check file permissions: `chmod 600 ~/.continue/.env.local`

### Google OAuth fails
- Ensure `google-credentials.json` path is correct in `.env.local`
- First run opens browser for OAuth—complete authorization
- Token is cached locally at `~/.continue/tokens.json` (don't commit)

---

## Files

| File | Purpose |
|------|---------|
| `~/.continue/config.yaml` | MCP server definitions (architecture) |
| `~/.continue/.env.example` | Template for credentials |
| `~/.continue/.env.local` | Actual credentials (git-ignored) |
| `~/.continue/google-credentials.json` | Google OAuth JSON file |
| `~/.continue/tokens.json` | Cached OAuth tokens (auto-generated) |

---

**Reference:** See `~/.continue/.env.example` for credential format and where to obtain them.
