# Preme OS MCP Connectors - Complete Setup Guide

**Last Updated:** 2026-09-21  
**Status:** Active Setup  
**Branch:** claude/vibrant-einstein-wcjd7l

---

## Overview

This guide covers setting up all Model Context Protocol (MCP) connectors for Preme OS on Windows with Continue (VS Code extension).

### What are MCPs?

MCPs are bridges between your LLM (Claude via OpenRouter) and external services:
- **Airtable** → Inventory management
- **Make.com** → Automation & StockX integration
- **Notion** → Release thesis documentation
- **Slack** → Monitoring alerts
- **Google Cloud** → Optional analytics

---

## Prerequisites

✅ **Windows Machine:** `C:\Users\Administrator\continue-demo\preme-os\`  
✅ **Node.js & npm** installed  
✅ **Continue** extension installed in VS Code  
✅ **OpenRouter API Key** configured

---

## Step 1: Install MCP Packages

In Command Prompt (cmd.exe):

```cmd
cd C:\Users\Administrator\continue-demo\preme-os
npm.cmd install @notionhq/notion-mcp-server slack-mcp-server
npm.cmd list
```

**Expected output:**
```
preme-os@
+-- @notionhq/notion-mcp-server@2.5.2
`-- slack-mcp-server@1.3.0
```

---

## Step 2: Generate API Tokens

Each connector requires a personal access token. Generate them in order:

### 2.1 Airtable PAT

1. Go to: https://airtable.com/create/tokens
2. Create new token with name: `preme-os`
3. **Scopes:** Select:
   - ✅ `data.records:read`
   - ✅ `data.records:write`
   - ✅ `schema.bases:read`
4. **Base access:** Select `appMgSuE6O4sXyxzE` (Preme OS)
5. Copy token (format: `pat1.XXXXX`)

### 2.2 Make.com API Key

1. Go to: https://make.com/profile#api-access
2. Create API key
3. Copy key (format: `sk_live_XXXXX`)
4. Note your **Team ID** (visible in dashboard or API response)

### 2.3 Notion Integration Token

1. Go to: https://www.notion.so/profile/integrations
2. Create new integration: "Preme OS"
3. Copy internal integration token (format: `ntn_XXXXX`)
4. Share your Notion workspace with the integration

### 2.4 Slack Bot Token

1. Go to: https://api.slack.com/apps/new
2. Create new app: "Preme OS Bot"
3. Go to "OAuth & Permissions"
4. Add scopes:
   - ✅ `chat:write`
   - ✅ `channels:read`
   - ✅ `users:read`
5. Install app to workspace
6. Copy **Bot User OAuth Token** (format: `xoxb_XXXXX`)

### 2.5 Google Service Account (Optional)

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Create service account: "preme-os"
3. Create JSON key
4. Download as: `C:\Users\Administrator\continue-demo\.continue\google-service-account.json`

---

## Step 3: Configure `.env.local`

1. Open: `C:\Users\Administrator\continue-demo\.continue\.env.local`
2. Fill in all tokens from Step 2:

```env
OPENROUTER_API_KEY=sk-or-v1-YOUR_KEY
AIRTABLE_TOKEN=pat1.YOUR_TOKEN
MAKE_API_KEY=sk_live_YOUR_KEY
MAKE_TEAM_ID=YOUR_TEAM_ID
MAKE_API_URL=https://us2.make.com/api/v2
NOTION_TOKEN=ntn_YOUR_TOKEN
NOTION_VERSION=2026-03-11
SLACK_BOT_TOKEN=xoxb.YOUR_BOT_TOKEN
SLACK_TEAM_ID=YOUR_WORKSPACE_ID
GOOGLE_SERVICE_ACCOUNT_JSON=google-service-account.json
```

**Security:** Never commit `.env.local` to git. Add to `.gitignore`:
```
.env.local
google-service-account.json
```

---

## Step 4: Test Connectivity

In **Continue** (VS Code), run these commands:

```
@airtable list-bases
```
**Expected:** Lists your Airtable bases, including `appMgSuE6O4sXyxzE`

```
@make list-scenarios
```
**Expected:** Lists your Make.com automation scenarios

```
@notion list-pages
```
**Expected:** Lists your Notion workspace pages

```
@slack search-channels
```
**Expected:** Lists Slack channels in your workspace

---

## Step 5: Verify Inventory Access

Run the inventory query script:

```cmd
cd C:\Users\Administrator\continue-demo\preme-os
node query-airtable-inventory.js
```

**Expected output:**
```
✅ Connected! Found 40 inventory items
📊 INVENTORY SUMMARY
  ✅ Matched to StockX:  37 items
  ❌ Unmatched:          3 items
```

---

## Troubleshooting

### "Token not found" errors

**Cause:** `.env.local` not in correct location or not loaded by Continue  
**Fix:**
1. Verify path: `C:\Users\Administrator\continue-demo\.continue\.env.local`
2. Restart VS Code
3. Run `node query-airtable-inventory.js` to test token loading

### "Airtable MCP not available"

**Cause:** Official Airtable MCP not set up in Continue  
**Workaround:** Use `query-airtable-inventory.js` script directly

### "Make.com Team ID not found"

**Cause:** Wrong Team ID in `.env.local`  
**Fix:**
1. Log into Make.com
2. Check profile → Team ID visible in sidebar
3. Update `MAKE_TEAM_ID` in `.env.local`

### "Notion pages not accessible"

**Cause:** Workspace not shared with integration  
**Fix:**
1. Go to Notion workspace settings
2. Integrations → Add "Preme OS" integration
3. Grant access to your workspace

---

## Phase 3 Tasks

Once all connectors are verified ✅:

### Option A: Inventory Audit
Test Make.com scenario `s5918951...stock_x_adapt` on unmatched items

### Option B: Release Monitoring
Validate Supreme FW26 Week 3 theses in Notion

### Option C: Zapier Automation
Debug & resume morning digest workflow

---

## Reference Files

- **Configuration:** `.env.example` → Copy to `.env.local`
- **Query Script:** `query-airtable-inventory.js` → Direct Airtable access
- **API Tokens:** See `TOKEN_GENERATION_*.md` files
- **Airtable Schema:** Base ID `appMgSuE6O4sXyxzE`, Table `tbla4c3FzE70sCP6B`

---

## Support

Contact: premeftpllc@gmail.com  
Repository: https://github.com/premeftpllc/1  
Branch: claude/vibrant-einstein-wcjd7l
