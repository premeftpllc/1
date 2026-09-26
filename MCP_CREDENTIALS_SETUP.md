> **⚠ SUPERSEDED (2026-09-26) - NOT A SOURCE OF TRUTH.** Describes a machine layout that no longer exists. To set up the PC, MacBook Neo or Mac mini, follow [docs/NEW-MACHINE-SETUP.md](docs/NEW-MACHINE-SETUP.md); for current state see `START_HERE.md`.

# MCP Credentials Setup Guide

**Status:** All MCPs configured and ready. Just add your credentials to `.env.local`

**Last Updated:** 2026-09-22  
**Config File:** `C:\Users\Administrator\.continue\config.yaml`  
**Credentials File:** `C:\Users\Administrator\.continue\.env.local`

---

## 🚀 Quick Start

1. Open `.env.local` in your editor
2. Find each service below
3. Follow the link, get the credential
4. Paste into `.env.local`
5. Save and restart Continue

**Format:** `KEY=value` (no quotes, one per line)

---

## 🔧 Service Setup Instructions

### 1️⃣ MAKE.COM (Automation Platform)
**Status:** Partially configured (4 pending credential requests)  
**What you get:** 146+ automation tools

#### Steps:
1. Go to: https://www.make.com/en/integrations/detail/api
2. Create API connection (if not exists)
3. Copy **API Key** → paste into `MAKE_API_KEY`
4. Go to Make > Settings > API to find **Team ID** → paste into `MAKE_TEAM_ID`
5. For `MAKE_MCP_AUTHORIZATION`: Already in current .env (paste same value)

#### .env.local lines:
```
MAKE_API_KEY=your_key_here
MAKE_TEAM_ID=2586938
MAKE_MCP_AUTHORIZATION=your_auth_token
```

**Note:** Make will show "4 pending credential requests" in UI - approve them when ready.

---

### 2️⃣ NOTION (Knowledge Base)
**Status:** Token provided but may be expired  
**What you get:** Search, create pages, manage databases

#### Steps:
1. Go to: https://www.notion.so/my-integrations
2. Create new integration (or select existing)
3. Click **Show** next to "Internal Integration Token"
4. Copy token → paste into `NOTION_TOKEN`
5. Open your workspace > Settings > Connections
6. Find the integration, click "Connect"

#### .env.local line:
```
NOTION_TOKEN=secret_abc123xyz...
```

**Note:** Previous token was rotated for security. Generate new one if getting 403 errors.

---

### 3️⃣ AIRTABLE (Database & Records)
**Status:** Quota exhausted (monthly reset: 2026-10-01)  
**What you get:** List/create/update records, manage bases

#### Steps:
1. Go to: https://airtable.com/account/tokens
2. Create Personal Access Token
3. Scopes needed: `data.records:read`, `data.records:write`, `schema.bases:read`
4. Copy token → paste into `AIRTABLE_TOKEN`

#### .env.local line:
```
AIRTABLE_TOKEN=pat_your_token_here
```

**Note:** API quota resets monthly. Once you add this token, it will work until 2026-10-01 when quota resets.

---

### 4️⃣ SLACK (Team Communication)
**Status:** Token format wrong (xoxe- instead of xoxb-)  
**What you get:** Send messages, read threads, search channels

#### Steps:
1. Go to: https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. Name: "PremeOS" | Workspace: select your workspace
4. Go to "OAuth & Permissions"
5. Under "Scopes" > "Bot Token Scopes", add:
   - `chat:write`
   - `channels:read`
   - `groups:read`
   - `users:read`
   - `search:read`
6. Click "Install to Workspace"
7. Copy **Bot User OAuth Token** (starts with `xoxb-`) → paste into `SLACK_BOT_TOKEN`

#### .env.local line:
```
SLACK_BOT_TOKEN=xoxb-your_bot_token_here
```

**Warning:** Current token is `xoxe-` format (refresh token, doesn't work). You need `xoxb-` format.

---

### 5️⃣ GOOGLE WORKSPACE (Gmail, Calendar, Drive)
**Status:** OAuth not configured  
**What you get:** Send/read email, manage calendar, access files

#### Steps:
1. Go to: https://console.cloud.google.com/
2. Create new project (or select existing): "PremeOS"
3. Enable APIs:
   - Gmail API
   - Google Calendar API
   - Google Drive API
4. Create OAuth 2.0 Credentials:
   - Application type: **Desktop application**
   - Add authorized redirect URI: `http://localhost:8888/callback` (for local dev)
5. Download credentials JSON
6. Extract:
   - `GOOGLE_CLIENT_ID`: from JSON → `client_id`
   - `GOOGLE_CLIENT_SECRET`: from JSON → `client_secret`
7. Also create **API Key** (not OAuth):
   - Go to "Credentials" > "Create Credentials" > "API Key"
   - Copy key → `GOOGLE_API_KEY`

#### .env.local lines:
```
GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here
GOOGLE_API_KEY=AIzaSyD...
```

**Note:** First time use will prompt you to authorize in browser. Subsequent uses will use cached auth.

---

### 6️⃣ SHOPIFY (E-Commerce)
**Status:** Not configured (optional)  
**What you get:** Manage products, orders, inventory

#### Steps:
1. Go to your Shopify Admin: https://admin.shopify.com
2. Settings > Apps > Develop apps
3. Create new app: Name "PremeOS"
4. Configuration tab > Admin API scopes:
   - Select needed scopes (products, orders, etc.)
5. Install app
6. Copy **Access Token** → paste into `SHOPIFY_ACCESS_TOKEN`
7. Your shop URL (e.g., `mystore.myshopify.com`) → paste into `SHOPIFY_SHOP_URL`

#### .env.local lines:
```
SHOPIFY_ACCESS_TOKEN=shpat_your_token_here
SHOPIFY_SHOP_URL=your-store.myshopify.com
```

**Note:** Only needed if you have Shopify store and need to manage it.

---

### 7️⃣ ZAPIER (Workflow Automation)
**Status:** Not configured (optional)  
**What you get:** 9000+ app integrations via Zapier

#### Steps:
1. Go to: https://zapier.com/integrations/mcp
2. Log in to your Zapier account
3. Copy the **MCP Server URL** (looks like `https://...`)
4. Paste into `ZAPIER_MCP_URL`

#### .env.local line:
```
ZAPIER_MCP_URL=https://your-zapier-mcp-url-here
```

**Note:** Zapier MCP URL is different from regular API key - get it from the MCP-specific page.

---

## 📋 Priority Order (What to Add First)

| Priority | Service | Effort | Impact |
|----------|---------|--------|--------|
| 🔴 **HIGH** | Make.com | 5 min | Unlocks 146 automation tools |
| 🔴 **HIGH** | Notion | 5 min | Unlocks workspace memory |
| 🟡 **MEDIUM** | Google (Gmail/Calendar) | 15 min | Email + scheduling |
| 🟡 **MEDIUM** | Slack | 10 min | Team communication |
| 🟢 **LOW** | Airtable | 5 min | Data management (quota limited) |
| 🟢 **LOW** | Shopify | 10 min | E-commerce (only if needed) |
| 🟢 **LOW** | Zapier | 5 min | Extra automation (optional) |

---

## ✅ After Adding Each Credential

1. **Edit** `.env.local`
2. **Add** credential line
3. **Save** file
4. **Restart** Continue (full VS Code restart recommended)
5. **Test** in Continue chat:
   ```
   Can you [action related to that service]?
   ```

Example:
```
Can you search my Notion for "PremeOS"?
Can you send a Slack message to #dev?
```

---

## 🔍 Troubleshooting

### "MCP server failed to start"
- Check credential is in `.env.local` with correct KEY name
- Verify endpoint/URL is correct (no typos)
- Restart VS Code fully (Ctrl+Shift+P > Reload Window)

### "403 Forbidden" or "Unauthorized"
- Token may be expired → regenerate
- Scopes may be missing → add required permissions
- Token format wrong (e.g., xoxe- instead of xoxb-) → get correct format

### "Connection timeout"
- Check VPN/firewall isn't blocking external API calls
- Service may be down → check status page
- Rate limit hit → wait a minute before retrying

### Model not appearing in Continue settings
- Make sure `.env.local` exists
- Verify config.yaml syntax is correct
- Do full VS Code restart (Ctrl+Shift+P > Reload Window)
- Check that nemotron-3-nano-4b is loaded in LM Studio

---

## 📞 Reference: Current Setup

| Component | Value |
|-----------|-------|
| **LM Studio** | 192.168.1.25:1235 (remote) |
| **Model** | nvidia/nemotron-3-nano-4b |
| **Context** | 500,000 tokens |
| **Max Output** | 250,000 tokens |
| **Speed** | 219 tokens/sec |
| **Accuracy** | 100% on test suite |

---

## 🎯 Next Steps

1. **Add Notion token** (easiest, highest value)
2. **Add Google OAuth** (covers Gmail/Calendar/Drive)
3. **Add Make.com API** (automation backbone)
4. **Test each one** to verify working
5. **Optional:** Add Slack, Shopify, Zapier as needed

---

*Generated: 2026-09-22*  
*Master Config: C:\Users\Administrator\.continue\config.yaml*  
*Credentials: C:\Users\Administrator\.continue\.env.local (gitignored)*
