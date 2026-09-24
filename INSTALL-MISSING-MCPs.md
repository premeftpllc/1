> **Superseded 2026-09-24.** Historical Windows/PC notes. Several package names and variable names below are wrong for Continue (for example @airtable/mcp-server, @anthropic-ai/gmail-mcp-server, make-custom-mcp, .env.local, ${VAR}). Use [docs/CONTINUE-MCP-ARCHITECTURE.md](docs/CONTINUE-MCP-ARCHITECTURE.md).

# Install Missing MCP Servers for Continue

**Status:** Action Required  
**Date:** 2026-09-21  
**Branch:** claude/vibrant-einstein-wcjd7l

---

## What You Need to Do

You have Make and Notion MCPs working in Continue. Now add **Airtable**, **Slack**, and **Gmail** MCPs.

---

## Step 1: Install MCP Packages

Run these commands in PowerShell (as Administrator) on your Windows machine:

```powershell
# Navigate to Continue directory
cd "C:\Users\Administrator\continue-demo"

# Install Airtable MCP
npm install @airtable/mcp-server

# Install Slack MCP  
npm install slack-mcp-server

# Install Gmail MCP
npm install @anthropic-ai/gmail-mcp-server

# Verify installations
npm list
```

**Expected output:**
```
preme-os@
├── @airtable/mcp-server@X.X.X
├── @anthropic-ai/gmail-mcp-server@X.X.X
├── @notionhq/notion-mcp-server@2.5.2
├── make-custom-mcp@X.X.X
├── slack-mcp-server@1.3.0
└── web-search-mcp-server@X.X.X
```

---

## Step 2: Update Continue Config

1. Open: `C:\Users\Administrator\continue-demo\.continue\config.yaml`

2. Find the `mcpServers:` section

3. Add these three new servers (copy from `continue-mcp-config.yaml` in this repo):

```yaml
  airtable:
    type: stdio
    command: node
    args: 
      - "%APPDATA%/npm/node_modules/@airtable/mcp-server/dist/index.js"
    env:
      AIRTABLE_TOKEN: "${AIRTABLE_TOKEN}"
    disabled: false
    tools:
      - "*"

  slack:
    type: stdio
    command: node
    args:
      - "%APPDATA%/npm/node_modules/slack-mcp-server/dist/index.js"
    env:
      SLACK_BOT_TOKEN: "${SLACK_BOT_TOKEN}"
      SLACK_TEAM_ID: "${SLACK_TEAM_ID}"
    disabled: false
    tools:
      - "*"

  gmail:
    type: stdio
    command: node
    args:
      - "%APPDATA%/npm/node_modules/@anthropic-ai/gmail-mcp-server/dist/index.js"
    env:
      GOOGLE_SERVICE_ACCOUNT_JSON: "${GOOGLE_SERVICE_ACCOUNT_JSON}"
    disabled: false
    tools:
      - "*"
```

---

## Step 3: Verify .env.local Has All Tokens

Confirm `C:\Users\Administrator\continue-demo\.continue\.env.local` contains:

```env
AIRTABLE_TOKEN=pat1.YOUR_TOKEN_HERE
SLACK_BOT_TOKEN=xoxb.YOUR_BOT_TOKEN_HERE
SLACK_TEAM_ID=YOUR_WORKSPACE_ID
GOOGLE_SERVICE_ACCOUNT_JSON=google-service-account.json
NOTION_TOKEN=ntn_YOUR_TOKEN_HERE
NOTION_VERSION=2026-03-11
MAKE_API_KEY=sk_live_YOUR_KEY_HERE
MAKE_TEAM_ID=YOUR_TEAM_ID
MAKE_API_URL=https://us2.make.com/api/v2
```

---

## Step 4: Restart Continue

1. Close VS Code completely
2. Reopen VS Code
3. Go to **Continue** → **Tools** (click the wrench icon)
4. You should now see six MCP servers:
   - ✅ airtable
   - ✅ slack
   - ✅ gmail
   - ✅ make
   - ✅ notion
   - ✅ web-search

---

## Step 5: Test in Continue Chat

Run these commands in Continue to verify each MCP works:

**Test Airtable:**
```
@airtable List your Airtable bases
```
**Expected:** Shows `appMgSuE6O4sXyxzE` (Preme OS base)

**Test Slack:**
```
@slack List all channels in the workspace
```
**Expected:** Lists your Slack channels

**Test Gmail:**
```
@gmail Show me my last 5 emails
```
**Expected:** Shows recent emails from your Gmail account

---

## Troubleshooting

### "MCP server not found" error
**Fix:** Restart VS Code after updating config.yaml

### "Token not found" error
**Fix:** 
1. Verify tokens are in `.env.local`
2. Restart VS Code
3. Check that file path is: `C:\Users\Administrator\continue-demo\.continue\.env.local`

### "Permission denied" on Gmail
**Fix:** 
1. Ensure `google-service-account.json` is in: `C:\Users\Administrator\continue-demo\.continue\`
2. Grant workspace access to the service account in Google Cloud Console

### "Airtable quota exceeded"
**Status:** Monthly API limit reached on 2026-09-21  
**When:** Quota resets on 2026-10-01  
**Workaround:** Use after quota resets, or wait for Airtable plan upgrade

---

## Next: Use MCPs in Continue

Once all three MCPs show in **Tools** with ✅:

1. **Inventory Management:** `@airtable Show unmatched products`
2. **Notifications:** `@slack Send alert to #alerts channel`
3. **Email Tracking:** `@gmail Search for StockX notifications`

This replaces the manual `query-airtable-inventory.js` script — everything runs directly in Continue chat now.

---

**Reference:** See `continue-mcp-config.yaml` in this repo for full configuration example.
